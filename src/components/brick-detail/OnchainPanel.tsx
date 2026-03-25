'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import {
    useConnection,
    useWriteContract,
    useWaitForTransactionReceipt,
    useEstimateFeesPerGas,
    useSwitchChain,
    useChainId,
} from 'wagmi';
import { ExternalLink, CheckCircle2 } from 'lucide-react';
import { parseEther, parseGwei } from 'viem';
import { useToast } from '@/hooks/useToast';
import type { BrickDetail, BrickMetadata } from '@/types/brick.types';
import { useGetDonations } from '@/hooks/apis/onchain.api';
import { useOnchainSocket } from '@/providers/OnchainSocketProvider';
import { useQueryClient } from '@tanstack/react-query';
import { IpfsStep, MintStep, DonationSection } from '@/components/brick-detail';

// Contract info
const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_BRIX_CONTRACT_ADDRESS ||
    '0x45C9fA8068fc4a5552073372efa8f5d5e9f67386') as `0x${string}`;
const IPFS_FEE = process.env.NEXT_PUBLIC_IPFS_FEE || '0.01';

const BRIX_REGISTRY_ABI = [
    {
        type: 'function',
        name: 'payForIPFS',
        inputs: [{ name: 'brickId', type: 'bytes32', internalType: 'bytes32' }],
        outputs: [],
        stateMutability: 'payable',
    },
    {
        type: 'function',
        name: 'mint',
        inputs: [
            { name: 'brickId', type: 'bytes32', internalType: 'bytes32' },
            { name: 'ipfsCid', type: 'string', internalType: 'string' },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'donate',
        inputs: [{ name: 'brickId', type: 'uint256', internalType: 'uint256' }],
        outputs: [],
        stateMutability: 'payable',
    },
] as const;

const uuidToBytes32 = (uuid: string): `0x${string}` => {
    const hex = uuid.replace(/-/g, '');
    const padded = hex.padEnd(64, '0');
    return `0x${padded}`;
};

interface OnchainPanelProps {
    brick: BrickDetail;
    isOwner?: boolean;
}

export function OnchainPanel({ brick, isOwner = false }: OnchainPanelProps) {
    const connection = useConnection();
    const isConnected = !!connection?.address;

    const toast = useToast();
    const t = useTranslations('onchain');
    const qc = useQueryClient();
    const { onIpfsUploaded, onBrickMinted } = useOnchainSocket();
    const { data: donations = [], isLoading: isLoadingDonations } = useGetDonations(brick.id);

    // Local optimistic metadata state
    const [localMeta, setLocalMeta] = useState<BrickMetadata | null>(brick.metadata ?? null);

    const [prevMetadataId, setPrevMetadataId] = useState(brick.metadata?.id);
    if (brick.metadata?.id !== prevMetadataId) {
        setLocalMeta(brick.metadata);
        setPrevMetadataId(brick.metadata?.id);
    }
    useEffect(() => {
        const unsubIpfs = onIpfsUploaded((data) => {
            if (data.brickId !== brick.id) return;
            toast.success(t('toast.ipfsComplete'));
            setLocalMeta((prev) =>
                prev
                    ? {
                          ...prev,
                          onChainStatus: 'ipfs_uploaded',
                          imageCid: data.imageCid,
                          ipfsCid: data.ipfsCid,
                          hashSha256: data.hashSha256,
                      }
                    : prev,
            );
            void qc.invalidateQueries({ queryKey: ['brick', brick.id] });
        });

        const unsubMint = onBrickMinted((data) => {
            if (data.brickId !== brick.id) return;
            toast.success(t('toast.mintComplete'));
            setLocalMeta((prev) =>
                prev
                    ? {
                          ...prev,
                          onChainStatus: 'onchain',
                          onChainTx: data.txHash,
                      }
                    : prev,
            );
            void qc.invalidateQueries({ queryKey: ['brick', brick.id] });
        });

        return () => {
            unsubIpfs();
            unsubMint();
        };
    }, [brick.id, onIpfsUploaded, onBrickMinted, toast, qc, t]);

    const ipfsMutation = useWriteContract();
    const hashIPFS = ipfsMutation.data;
    const isConfirmingIPFS = ipfsMutation.isPending;

    const { isLoading: isWaitingIPFS, isSuccess: isIPFSTxConfirmed } = useWaitForTransactionReceipt(
        { hash: hashIPFS },
    );

    const mintMutation = useWriteContract();
    const hashMint = mintMutation.data;
    const isConfirmingMint = mintMutation.isPending;

    const { isLoading: isWaitingMint, isSuccess: isMintTxConfirmed } = useWaitForTransactionReceipt(
        { hash: hashMint },
    );

    const donateMutation = useWriteContract();
    const hashDonate = donateMutation.data;
    const isConfirmingDonate = donateMutation.isPending;

    const { isSuccess: isDonateTxConfirmed } = useWaitForTransactionReceipt({
        hash: hashDonate,
    });

    const switchChainMutation = useSwitchChain();
    const currentChainId = useChainId();
    const TARGET_CHAIN_ID = Number(process.env.NEXT_PUBLIC_TARGET_CHAIN_ID || 80002);

    const [donateAmount, setDonateAmount] = useState('1');
    const { data: feeData } = useEstimateFeesPerGas();

    const getGasParams = useCallback(() => {
        const gasParams: { maxFeePerGas?: bigint; maxPriorityFeePerGas?: bigint } = {};
        const MIN_TIP = parseGwei('30');
        const MIN_FEE = parseGwei('40');

        gasParams.maxPriorityFeePerGas =
            feeData?.maxPriorityFeePerGas && feeData.maxPriorityFeePerGas > MIN_TIP
                ? feeData.maxPriorityFeePerGas
                : MIN_TIP;

        gasParams.maxFeePerGas =
            feeData?.maxFeePerGas && feeData.maxFeePerGas > MIN_FEE
                ? feeData.maxFeePerGas
                : MIN_FEE;

        if (gasParams.maxFeePerGas < gasParams.maxPriorityFeePerGas) {
            gasParams.maxFeePerGas = gasParams.maxPriorityFeePerGas + parseGwei('10');
        }

        return gasParams;
    }, [feeData]);

    // ─── Polling fallback ─────────────────────────────────────────

    const shouldPollIpfs =
        localMeta?.onChainStatus === 'pending' ||
        (isIPFSTxConfirmed && localMeta?.onChainStatus == null);
    const shouldPollMint = isMintTxConfirmed && localMeta?.onChainStatus === 'ipfs_uploaded';
    const isPolling = shouldPollIpfs || shouldPollMint;

    useEffect(() => {
        let interval: NodeJS.Timeout | undefined;
        if (isPolling) {
            interval = setInterval(() => {
                void qc.invalidateQueries({ queryKey: ['brick', brick.id] });
            }, 3000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isPolling, brick.id, qc]);

    // Eager toast + status update after confirmation
    const hasToastedIPFSRef = useRef(false);
    useEffect(() => {
        if (
            isIPFSTxConfirmed &&
            !hasToastedIPFSRef.current &&
            localMeta?.onChainStatus !== 'ipfs_uploaded' &&
            localMeta?.onChainStatus !== 'onchain'
        ) {
            hasToastedIPFSRef.current = true;
            toast.info(t('toast.processingIpfs'));
            queueMicrotask(() => {
                setLocalMeta((prev) => (prev ? { ...prev, onChainStatus: 'pending' } : prev));
            });
        }
    }, [isIPFSTxConfirmed, localMeta?.onChainStatus, toast, t]);

    // Invalidate donations on success
    useEffect(() => {
        if (isDonateTxConfirmed) {
            void qc.invalidateQueries({ queryKey: ['brick-donations', brick.id] });
        }
    }, [isDonateTxConfirmed, brick.id, qc]);

    // ─── Handlers ────────────────────────────────────────────────

    const verifiedAt = localMeta?.verifiedAt;

    const handlePayForIPFS = useCallback(async () => {
        if (!verifiedAt || !isConnected) {
            toast.error(t('toast.connectWallet'));
            return;
        }

        if (currentChainId !== TARGET_CHAIN_ID) {
            try {
                await switchChainMutation.mutateAsync({ chainId: TARGET_CHAIN_ID });
            } catch {
                toast.error('Please switch to Polygon Amoy to continue');
                return;
            }
        }

        const gasParams = getGasParams();

        ipfsMutation.mutate(
            {
                address: CONTRACT_ADDRESS,
                abi: BRIX_REGISTRY_ABI,
                functionName: 'payForIPFS',
                args: [uuidToBytes32(brick.id)],
                value: parseEther(IPFS_FEE),
                chainId: TARGET_CHAIN_ID,
                ...gasParams,
            },
            {
                onSuccess: () => toast.success(t('toast.ipfsSubmitted')),
                onError: (error) =>
                    toast.error(
                        t('toast.ipfsFailed', { error: error?.message ?? 'Unknown error' }),
                    ),
            },
        );
    }, [
        verifiedAt,
        isConnected,
        currentChainId,
        switchChainMutation,
        getGasParams,
        ipfsMutation,
        brick.id,
        toast,
        TARGET_CHAIN_ID,
        t,
    ]);

    const ipfsCid = localMeta?.ipfsCid;

    const handleMint = useCallback(async () => {
        if (!ipfsCid || !isConnected) {
            toast.error(t('toast.missingCid'));
            return;
        }

        if (currentChainId !== TARGET_CHAIN_ID) {
            try {
                await switchChainMutation.mutateAsync({ chainId: TARGET_CHAIN_ID });
            } catch {
                toast.error('Please switch to Polygon Amoy to continue');
                return;
            }
        }

        const gasParams = getGasParams();

        mintMutation.mutate(
            {
                address: CONTRACT_ADDRESS,
                abi: BRIX_REGISTRY_ABI,
                functionName: 'mint',
                args: [uuidToBytes32(brick.id), ipfsCid],
                chainId: TARGET_CHAIN_ID,
                ...gasParams,
            },
            {
                onSuccess: () => toast.success(t('toast.mintSubmitted')),
                onError: (error) =>
                    toast.error(
                        t('toast.mintFailed', { error: error?.message ?? 'Unknown error' }),
                    ),
            },
        );
    }, [
        ipfsCid,
        isConnected,
        currentChainId,
        switchChainMutation,
        getGasParams,
        mintMutation,
        brick.id,
        toast,
        TARGET_CHAIN_ID,
        t,
    ]);

    const onChainId = localMeta?.onChainId;

    const handleDonate = useCallback(async () => {
        if (!onChainId || !donateAmount || !isConnected) {
            toast.error(t('toast.donateDataMissing'));
            return;
        }

        if (currentChainId !== TARGET_CHAIN_ID) {
            try {
                await switchChainMutation.mutateAsync({ chainId: TARGET_CHAIN_ID });
            } catch {
                toast.error('Please switch to Polygon Amoy to continue');
                return;
            }
        }

        const gasParams = getGasParams();

        donateMutation.mutate(
            {
                address: CONTRACT_ADDRESS,
                abi: BRIX_REGISTRY_ABI,
                functionName: 'donate',
                args: [BigInt(onChainId)],
                value: parseEther(donateAmount),
                chainId: TARGET_CHAIN_ID,
                ...gasParams,
            },
            {
                onSuccess: () => {
                    toast.success(t('toast.donateSubmitted'));
                    setDonateAmount('1');
                },
                onError: (error) =>
                    toast.error(
                        t('toast.donateFailed', { error: error?.message ?? 'Unknown error' }),
                    ),
            },
        );
    }, [
        onChainId,
        donateAmount,
        isConnected,
        currentChainId,
        switchChainMutation,
        getGasParams,
        donateMutation,
        toast,
        TARGET_CHAIN_ID,
        t,
    ]);

    // ─── UI ──────────────────────────────────────────────────────

    const isOnChain = localMeta?.onChainStatus === 'onchain';

    if (!localMeta?.verifiedAt) return null;

    return (
        <div className="mt-6 border border-primary/20 bg-background/50 backdrop-blur-md p-5 rounded-xl space-y-6 shadow-xl shadow-primary/5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                    {t('dashboardTitle')}
                    {isOnChain && <CheckCircle2 className="size-4 text-green-500" />}
                </h3>
                {localMeta.onChainTx && (
                    <a
                        href={`https://amoy.polygonscan.com/tx/${localMeta.onChainTx}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                    >
                        {t('viewTx')} <ExternalLink className="size-3" />
                    </a>
                )}
            </div>

            {/* Steps */}
            <div className="space-y-6">
                <IpfsStep
                    status={localMeta?.onChainStatus || null}
                    isOwner={isOwner}
                    isDistributing={isConfirmingIPFS || isWaitingIPFS}
                    onDistribute={handlePayForIPFS}
                    fee={IPFS_FEE}
                />

                <MintStep
                    status={localMeta?.onChainStatus || null}
                    isOwner={isOwner}
                    isMinting={isConfirmingMint || isWaitingMint}
                    onMint={handleMint}
                    ipfsCid={localMeta?.ipfsCid || null}
                    imageCid={localMeta?.imageCid || null}
                    onChainTx={localMeta?.onChainTx || null}
                    isMintTxConfirmed={isMintTxConfirmed}
                />
            </div>

            {/* Donation */}
            {isOnChain && (
                <div className="border-t border-primary/10 pt-6">
                    <DonationSection
                        isConnected={isConnected}
                        isDonating={isConfirmingDonate}
                        donateAmount={donateAmount}
                        onDonateAmountChange={setDonateAmount}
                        onDonate={handleDonate}
                        donations={donations}
                        isLoadingDonations={isLoadingDonations}
                    />
                </div>
            )}
        </div>
    );
}
