# Local Ansible Deployment Guide (WSL)

This guide explains how to run the BRIX-Web Ansible playbooks from your local Windows machine using WSL.

---

## 1. Prerequisites

- Windows 10/11 with WSL (Ubuntu recommended).
- Private key file (.pem) for your EC2 instance.
- The public IP address of your EC2 instance.

---

## 2. Setup Ansible on WSL

Open your WSL terminal and run the following commands to install Ansible:

```bash
sudo apt update
sudo apt install -y ansible
```

Verify the installation:

```bash
ansible --version
```

---

## 3. Prepare SSH Key and Inventory

### 3.1 Setup SSH Key

Ensure your PEM key has the correct permissions. Only your user should be able to read it:

```bash
# Replace with your actual path, e.g., /mnt/c/Users/Admin/Downloads/key.pem
chmod 400 ~/path/to/your-key.pem
```

### 3.2 Update Inventory

Edit the file ansible/inventory.ini and replace [IP_ADDRESS] with your actual EC2 public IP and pointing to your local key path:

```ini
[webserver]
your.ec2.ip.here ansible_user=ubuntu ansible_ssh_private_key_file=~/path/to/your-key.pem
```

---

## 4. Running Playbooks

### 4.1 Run the Entire Stack (Recommended)

This will set up Docker, create the network, and deploy the full Nginx/App/Portainer stack:

```bash
ansible-playbook -i ansible/inventory.ini ansible/deploy_all.yml -e "image_tag=latest" -e "portainer_admin_password=your_secure_password"
```

### 4.2 Run Individual Playbooks

If you only want to update a specific component:

- Only Nginx:
    ```bash
    ansible-playbook -i ansible/inventory.ini ansible/deploy_nginx.yml
    ```
- Only Docker Installation:
    ```bash
    ansible-playbook -i ansible/inventory.ini ansible/install_docker.yml
    ```

---

## 5. Advanced Usage

### 5.1 Specify a Single Node

If you have multiple servers in your inventory but only want to run on one:

```bash
ansible-playbook -i ansible/inventory.ini ansible/deploy_all.yml --limit your.ec2.ip.here
```

### 5.2 Pass Extra Variables

Since the playbooks rely on dynamic tags and passwords, always use the -e flag to provide them:

```bash
-e "image_tag=latest"              # Define which docker image tag to pull
-e "portainer_admin_password=xxx"  # Define the admin password for Portainer
```

---

## 6. Connectivity Troubleshooting

Test if Ansible can reach your server before running a playbook:

```bash
ansible all -i ansible/inventory.ini -m ping
```

If you see "pong", the connection is working correctly.
