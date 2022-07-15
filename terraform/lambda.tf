resource "aws_lambda_function" "lambda_function" {
	filename                       = var.lambda_name
  function_name                  = var.lambda_name
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
			KEY_TOKEN	= var.key_token
			NODE_ENV = var.node_env
    }
  }

}

