terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
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
  region  = "us-east-1"
}