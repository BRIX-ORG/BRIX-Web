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

The inventory file (`ansible/inventory.ini`) is where you define your servers and their configurations. Below is an overview of key Ansible inventory concepts used in the BRIX project.

| Concept                      | Usage / Example                                                                                       |
| :--------------------------- | :---------------------------------------------------------------------------------------------------- |
| **Single Host**              | `[webserver_single]` → Targets a single, unique host for specific tasks.                              |
| **Group**                    | `[webservers]`, `[dbservers]` → Clusters multiple hosts of the same type (frontend, backend, DB).     |
| **Group Vars**               | `[webservers:vars]` → Defines common settings (user, SSH key, port) for an entire group.              |
| **Host Vars**                | `34.224.234.115 ansible_user=ubuntu_custom` → Overrides group-level variables for a specific host.    |
| **Children / Nested Groups** | `[allservers:children]` → Combines multiple groups to target them all with one command.               |
| **Extra Group Vars**         | `[allservers:vars]` → Variables (like `env=production`) applied to every host in the children groups. |

#### Example `inventory.ini` for BRIX Project

```ini
# --- Individual Hosts ---
[webserver_single]
34.224.234.114 ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/brix.pem

# --- Grouping Infrastructure ---
[webservers]
34.224.234.114
34.224.234.115

[dbservers]
100.55.40.167
100.55.40.168

[redisservers]
172.31.86.236

# --- Group Variables ---
[webservers:vars]
ansible_user=ubuntu
ansible_ssh_private_key_file=~/.ssh/brix.pem
ansible_port=22
ansible_python_interpreter=/usr/bin/python3

# --- Host-Level Overrides ---
34.224.234.115 ansible_user=ubuntu_custom ansible_port=2222

# --- Nested Architecture (Children Groups) ---
[allservers:children]
webservers
dbservers
redisservers

# --- Global Group Variables ---
[allservers:vars]
env=production
docker_network=brix_network
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

### 5.1 Specify Targets (Limit)

Use the `-l` (limit) flag to run a playbook against a specific host or group from your inventory:

- **Run on a single host:**
    ```bash
    ansible-playbook -i ansible/inventory.ini site.yml -l webserver_single
    ```
- **Run on a specific group:**
    ```bash
    ansible-playbook -i ansible/inventory.ini site.yml -l webservers
    ```
- **Run on multiple groups:**
    ```bash
    ansible-playbook -i ansible/inventory.ini site.yml -l webservers,dbservers
    ```
- **Run on a nested group:**
    ```bash
    ansible-playbook -i ansible/inventory.ini site.yml -l allservers
    ```

### 5.2 Pass Extra Variables

Since the playbooks rely on dynamic tags and passwords, always use the -e flag to provide them:

```bash
-e "image_tag=latest"              # Define which docker image tag to pull
-e "portainer_admin_password=xxx"  # Define the admin password for Portainer
```

---

## 6. Connectivity Troubleshooting

Before running a complex playbook, always test the connection to your targets using the `ping` module:

- **Test connection to all servers:**
    ```bash
    ansible all -i ansible/inventory.ini -m ping
    ```
- **Test connection to a specific group (e.g., webservers):**
    ```bash
    ansible webservers -i ansible/inventory.ini -m ping
    ```

If you see a `"pong"` response, Ansible is successfully communicating with your servers.
