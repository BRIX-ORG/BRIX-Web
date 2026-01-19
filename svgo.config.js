const config = {
    plugins: [
        {
            name: 'preset-default',
            params: {
                overrides: {
                    cleanupIds: false,
                },
            },
        },
        'removeDimensions',
        'sortAttrs',
        {
            name: 'addAttributesToSVGElement',
            params: {
                attributes: [{ 'aria-hidden': 'true' }],
            },
        },
    ],
};

module.exports = config;
