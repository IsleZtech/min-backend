resource "aws_api_gateway_rest_api" "api" {
  name        = var.api_name
  description = var.api_description

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

resource "aws_api_gateway_resource" "proxy" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "proxy" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.proxy.id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "proxy_root" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_rest_api.api.root_resource_id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_method.proxy.resource_id
  http_method = aws_api_gateway_method.proxy.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.lambda_invoke_arn
}

resource "aws_api_gateway_integration" "lambda_root" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_method.proxy_root.resource_id
  http_method = aws_api_gateway_method.proxy_root.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.lambda_invoke_arn
}

resource "aws_api_gateway_deployment" "api" {
  depends_on = [
    aws_api_gateway_integration.lambda,
    aws_api_gateway_integration.lambda_root,
  ]

  rest_api_id = aws_api_gateway_rest_api.api.id
  stage_name  = var.stage_name
}

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.api.execution_arn}/*/*"
}

# Custom Domain Configuration
resource "aws_api_gateway_domain_name" "custom_domain" {
  count                    = var.create_custom_domain ? 1 : 0
  domain_name              = var.custom_domain_name
  regional_certificate_arn = var.certificate_arn
  
  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

resource "aws_api_gateway_base_path_mapping" "mapping" {
  count       = var.create_custom_domain ? 1 : 0
  api_id      = aws_api_gateway_rest_api.api.id
  stage_name  = var.stage_name
  domain_name = aws_api_gateway_domain_name.custom_domain[0].domain_name
  depends_on  = [aws_api_gateway_deployment.api]
}

# Route53 Record
data "aws_route53_zone" "main" {
  count   = var.create_custom_domain ? 1 : 0
  zone_id = var.hosted_zone_id
}

resource "aws_route53_record" "api_gateway" {
  count   = var.create_custom_domain ? 1 : 0
  zone_id = data.aws_route53_zone.main[0].zone_id
  name    = var.custom_domain_name
  type    = "A"

  alias {
    name                   = aws_api_gateway_domain_name.custom_domain[0].regional_domain_name
    zone_id                = aws_api_gateway_domain_name.custom_domain[0].regional_zone_id
    evaluate_target_health = false
  }
}