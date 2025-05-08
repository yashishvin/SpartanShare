resource "aws_launch_template" "spartanshare1" {
  name_prefix   = "spartanshare1"
  image_id      = "ami-0d53d72369335a9d6"
  instance_type = "t2.nano"
}

resource "aws_autoscaling_group" "spartanshare1" {
  availability_zones = ["us-west-1b", "us-west-1c"]
  desired_capacity   = 2
  max_size           = 4
  min_size           = 2
 
  load_balancers = [aws_elb.spartanbalancer1.name]
  launch_template {
    id      = aws_launch_template.spartanshare1.id
    version = "$Latest"
  }
}
