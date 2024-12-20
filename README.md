Veilshare

Veilshare is an image sharing app that allows users to upload images then receive a link with a set expiry date. Once that expiry date is passed the link cannot be used to access the image.
Images are stored in an Azure storage account and will be automatically deleted after 24 hours. 
The image Access links are stored in an Azure CosmoDB database and will be deleted after the set expiry time. To do this an Azure timed trigger function is used that runs every 2 hours and deletes any
DB entries that are past the expiry date & time.
