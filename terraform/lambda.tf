data "archive_file" "lambda_terraform_test" {
  type = "zip"

  source_dir  = path.root
  output_path = "${path.module}/terraform_test.zip"
}


resource "aws_lambda_function" "lambda_function" {
  source_code_hash               = data.archive_file.lambda_terraform_test.output_base64sha256
  function_name                  = var.lambda_name
  filename                       = "terraform_test.zip"
  role                           = var.arn_role
  handler                        = var.lambda_handler
  runtime                        = var.lambda_runtime
  memory_size                    = 256
  timeout                        = var.lambda_timeout
  reserved_concurrent_executions = 50

  depends_on = [
    aws_cloudwatch_log_group.cloudwatch_log
  ]

  environment {
    variables = {
      DB_PASSWORD = var.db_password
      DB_USERNAME = var.db_username
      KEY_TOKEN   = var.key_token
      NODE_ENV    = var.node_env
    }
  }

}

