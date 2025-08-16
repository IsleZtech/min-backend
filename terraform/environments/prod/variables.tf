variable "region" {
  type    = string
  default = "ap-northeast-1"
}

variable "account_id" {
  type    = string
  default = "190623961132"
}

variable "image_tag" {
  description = "Docker image tag to deploy"
  type        = string
  default     = "latest"
}
