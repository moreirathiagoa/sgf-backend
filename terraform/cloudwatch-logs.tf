resource "aws_cloudwatch_log_group" "cloudwatch_log" {
  name              = var.lambda_name
  retention_in_days = 90
}
