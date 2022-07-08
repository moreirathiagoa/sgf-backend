resource "aws_s3_bucket" "s3Bucket" {
     bucket = "sgf-test"
     acl       = "private"



   website {
       index_document = "index.html"
   }
}