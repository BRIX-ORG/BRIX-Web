output "instance_public_ip" {
  value = aws_instance.brix_web.public_ip
}

output "instance_id" {
  value = aws_instance.brix_web.id
}
