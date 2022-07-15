variable "region" {
  type    = string
  default = "us-east-1" #fixo no momento
}

variable "lambda_zip" {
  type    = string
  default = "no_zip"
}

variable "lambda_name" {
  type    = string
  default = "value"
}

variable "lambda_handler" {
  type    = string
  default = "index.handler"
}

variable "arn_role" {
  type    = string
  default = "arn_role"
}

variable "lambda_runtime" {
  type    = string
  default = "nodejs14.x"
}

variable "lambda_timeout" {
  type    = number
  default = 60
}

variable "db_password" {
  type    = string
  default = "123"
}

variable "db_username" {
  type    = string
  default = "abc"
}

variable "key_token" {
  type    = string
  default = "qwerty"
}

variable "node_env" {
  type    = string
  default = "hml"
}