# Security Groups for us-west-1
resource "aws_security_group" "allow_ssh_http_west1" {
  name        = "allow_ssh_http_1"
  description = "Allow TLS inbound traffic and all outbound traffic"
  vpc_id      = module.vpc_west1.vpc_id
  tags = {
    Name = "allow_ssh_http_1"
  }
}

resource "aws_security_group" "icmp_sg_west1" {
  name        = "allow_icmp_1"
  description = "Allow all ICMP traffic"
  vpc_id      = module.vpc_west1.vpc_id
  tags = {
    Name = "allow_icmp_1"
  }
}

resource "aws_security_group" "allow_ssh_http_from_bastion_west1" {
  name        = "allow_ssh_http_from_bastion_1"
  description = "Allow ssh from the bastion in the vpc"
  vpc_id      = module.vpc_west1.vpc_id
  tags = {
    Name = "allow_ssh_from_bastion_1"
  }
}


# Rules for us-west-1
resource "aws_vpc_security_group_ingress_rule" "allow_http_ipv4_west1" {
  security_group_id = aws_security_group.allow_ssh_http_west1.id
  from_port        = 80
  cidr_ipv4        = "0.0.0.0/0"
  ip_protocol      = "tcp"
  to_port          = 80
}

resource "aws_vpc_security_group_ingress_rule" "allow_http_ipv6_west1" {
  security_group_id = aws_security_group.allow_ssh_http_west1.id
  from_port        = 80
  cidr_ipv6        = "::/0"
  ip_protocol      = "tcp"
  to_port          = 80
}

resource "aws_vpc_security_group_ingress_rule" "allow_ssh_ipv4_west1" {
  security_group_id = aws_security_group.allow_ssh_http_west1.id
  from_port        = 22
  cidr_ipv4        = "0.0.0.0/0"
  ip_protocol      = "tcp"
  to_port          = 22
}

resource "aws_vpc_security_group_ingress_rule" "allow_ssh_ipv6_west1" {
  security_group_id = aws_security_group.allow_ssh_http_west1.id
  from_port        = 22
  cidr_ipv6        = "::/0"
  ip_protocol      = "tcp"
  to_port          = 22
}

resource "aws_vpc_security_group_egress_rule" "allow_all_traffic_ipv4_west1" {
  security_group_id = aws_security_group.allow_ssh_http_west1.id
  cidr_ipv4        = "0.0.0.0/0"
  ip_protocol      = "-1"
}

resource "aws_vpc_security_group_egress_rule" "allow_all_traffic_ipv6_west1" {
  security_group_id = aws_security_group.allow_ssh_http_west1.id
  cidr_ipv6        = "::/0"
  ip_protocol      = "-1"
}

resource "aws_security_group_rule" "allow_ssh_from_bastion_west1" {
  type                     = "ingress"
  from_port                = 22
  to_port                  = 22
  protocol                 = "tcp"
  security_group_id        = aws_security_group.allow_ssh_http_from_bastion_west1.id
  source_security_group_id = aws_security_group.allow_ssh_http_west1.id
}
resource "aws_security_group_rule" "private_http_access_west1" {
  type                     = "ingress"
  from_port                = 8080
  to_port                  = 8080
  protocol                 = "tcp"
  description              = "HTTP Access from frontend server"
  security_group_id        = aws_security_group.allow_ssh_http_from_bastion_west1.id
  source_security_group_id =  aws_security_group.allow_ssh_http_west1.id
}

resource "aws_security_group_rule" "private_db_access_west1" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  description              = "SSH Access from frontend server"
  security_group_id        = aws_security_group.allow_ssh_http_from_bastion_west1.id
  source_security_group_id = aws_security_group.allow_ssh_http_west1.id
}
resource "aws_vpc_security_group_egress_rule" "allow_all_bastiontraffic_ipv4_west1" {
  security_group_id = aws_security_group.allow_ssh_http_from_bastion_west1.id
  cidr_ipv4        = "0.0.0.0/0"
  ip_protocol      = "-1"
}

resource "aws_vpc_security_group_egress_rule" "allow_all_bastiontraffic_ipv6_west1" {
  security_group_id = aws_security_group.allow_ssh_http_from_bastion_west1.id
  cidr_ipv6        = "::/0"
  ip_protocol      = "-1"
}
resource "aws_vpc_security_group_ingress_rule" "icmp_ingress_ipv4_west1" {
  security_group_id = aws_security_group.icmp_sg_west1.id
  from_port        = -1
  to_port          = -1
  ip_protocol      = "icmp"
  cidr_ipv4        = "0.0.0.0/0"
}

resource "aws_vpc_security_group_ingress_rule" "allow_sqs_responses" {
  security_group_id = aws_security_group.allow_ssh_http_from_bastion_west1.id
  from_port        = 443
  to_port          = 443
  ip_protocol      = "tcp"
  cidr_ipv4        = "0.0.0.0/0"  # Allow responses from AWS SQS endpoints
}

resource "aws_vpc_security_group_egress_rule" "allow_sqs_access" {
  security_group_id = aws_security_group.allow_ssh_http_from_bastion_west1.id
  from_port        = 443
  to_port          = 443
  ip_protocol      = "tcp"
  cidr_ipv4        = "0.0.0.0/0"  # To reach AWS SQS endpoints
}


