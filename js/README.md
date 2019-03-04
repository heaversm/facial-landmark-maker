# LANDMARKER

Generates [Facial Landmarks](https://www.pyimagesearch.com/2017/04/03/facial-landmarks-dlib-opencv-python/) based off the [IBUG 300-W](https://ibug.doc.ic.ac.uk/resources/facial-point-annotations/) which can be manipulated to fit images in which a face cannot be detected. This is useful in machine learning and computer vision applications such as DLib and openCV.

I built this to use [FaceMorph](https://github.com/valillon/FaceMorph) with images unrecognizable by openCV face detection.

## Instructions

Specify the URL to the image you want to load. If you are using this locally, make sure to include the directory from this file (e.g. _'assets/myimage.png'_. Then hit _load_.

Drag the points to fit the image. Then click _save landmarks_ to save the points to a text file.

If you want to load a previous landmarks file, specify its URL (web) or file path (local), e.g._'assets/myfile.txt'_, and click _load_

If the lines are hard to see on your image, you can choose a color to change the line theme.

