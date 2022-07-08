terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      Version = "~>3.27"
    }
  }

  required_version = ">=0.14.9"

	backend "s3" {
    bucket = "terraform-sgf"
    key  = "terraform.tfstate"
    region = "us-east-1"
  }

}

provider "aws" {
  version = "~>3.0"
  region  = "us-east-1"
}