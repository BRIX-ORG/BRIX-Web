provider "aws" {
  region = var.aws_region
}

resource "aws_instance" "brix_web" {
  ami           = var.ami_id
  instance_type = var.instance_type
  key_name      = var.key_name

  # Network
  vpc_security_group_ids = var.security_group_ids
  associate_public_ip_address = true

  # Storage
  root_block_device {
    volume_size = 8
    volume_type = "gp3"
  }

  tags = {
    Name = "brix-web-server"
    Project = "BRIX"
  }
}
