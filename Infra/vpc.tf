terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.97.0"
    }
    tls = {
      source  = "hashicorp/tls"
      version = ">= 3.0.0"
    }
  }
  required_version = ">= 1.2.0"
}

provider "aws" {
  region = "us-west-1"
}

provider "aws" {
  alias  = "usw2"
  region = "us-west-2"
}

# VPC for us-west-1
module "vpc_west1" {
  source  = "terraform-aws-modules/vpc/aws"
  version = ">= 3.0.0"
  
  name    = "spartan-west1-vpc"
  cidr    = "10.0.0.0/16"
  
  azs             = ["us-west-1b", "us-west-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]
  
  create_igw         = true
  enable_nat_gateway = true
}

output "vpc_west1_id" {
  value = module.vpc_west1.vpc_id
}
