# Get AWS Account ID
data "aws_caller_identity" "current" {}

# IAM Role for EventBridge
resource "aws_iam_role" "eventbridge_role" {
  name = "eventbridge-ssm-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "events.amazonaws.com"
        }
      }
    ]
  })
}

# IAM Policy for EventBridge to invoke SSM
resource "aws_iam_role_policy" "eventbridge_policy" {
  name = "eventbridge-ssm-policy"
  role = aws_iam_role.eventbridge_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssm:StartAutomationExecution"
        ]
        Resource = "*"
      }
    ]
  })
}

# CloudWatch Alarms
resource "aws_cloudwatch_metric_alarm" "asg_status_check_west1" {
  alarm_name          = "asg-status-check-failed-west1"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name        = "StatusCheckFailed"
  namespace          = "AWS/EC2"
  period             = "60"
  statistic          = "Maximum"
  threshold          = "0"
  
  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.spartanshare1.name
  }
}


# EventBridge Rules
resource "aws_cloudwatch_event_rule" "restart_asg_west1" {
  name        = "restart-asg-instances-west1"
  description = "Restart ASG instances on status check failure"

  event_pattern = jsonencode({
    source      = ["aws.cloudwatch"]
    detail-type = ["CloudWatch Alarm State Change"]
  })
}

# EventBridge Targets
resource "aws_cloudwatch_event_target" "restart_asg_target_west1" {
  rule      = aws_cloudwatch_event_rule.restart_asg_west1.name
  target_id = "RestartASGInstances"
  arn       = "arn:aws:ssm:us-west-1:${data.aws_caller_identity.current.account_id}:automation-definition/AWS-RestartEC2Instance"
  role_arn  = aws_iam_role.eventbridge_role.arn
  
  input = jsonencode({
    AutoScalingGroupName = aws_autoscaling_group.spartanshare1.name
  })
}

