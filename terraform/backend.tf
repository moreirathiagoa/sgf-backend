terraform {
  backend "s3" {
    bucket = "terraform-sgf"
    key  = "terraform.tfstate"
    region = "us-east-1"
  }

}
