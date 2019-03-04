# LANDMARKER

Generates [Facial Landmarks](https://www.pyimagesearch.com/2017/04/03/facial-landmarks-dlib-opencv-python/) based off the [IBUG 300-W](https://ibug.doc.ic.ac.uk/resources/facial-point-annotations/) which can be manipulated to fit images in which a face cannot be detected. This is useful in machine learning and computer vision applications such as DLib and openCV.

I built this to use [FaceMorph](https://github.com/valillon/FaceMorph) with images unrecognizable by openCV face detection.


## Instructions

Launch `index.html` in a web browser to get started.

Specify the URL to the image you want to load. If you are using this locally, make sure to include the directory from this file (e.g. _'assets/myimage.png'_. Then hit _load_.

Drag the points to fit the image. Then click _save landmarks_ to save the points to a text file.

If you want to load a previous landmarks file, specify its URL (web) or file path (local), e.g._'assets/myfile.txt'_, and click _load_

If the lines are hard to see on your image, you can choose a color to change the line theme.


## Troubleshooting

If you don't see an image or don't see your loaded points, it is probably a cross-domain issue. If you are running this from a local web server (or your local file system), you will only be able to access images and files on that file system, not on the web, i.e., you cannot load `http://mysite.com/myimage.png` from `localhost:8000` or `file:///Users/[user]/landmark-maker/index.html`. And if you are running this on a web server, you cannot load an image from your hard drive. 

## Demo

[You can view a demo here](https://prototypes.mikeheavers.com/landmarker/)

Try loading a points file that will fit the _face_ by entering `assets/001.txt` into the points field and hitting `load`.

Then try loading an image by entering `assets/002.png` into the image field and hitting `load`.

If the lines are hard to see, try changing the colors by clicking on the color swatches.

Then drag the points to fit the new image. 

By default, it will select the closest point to wherever you clicked. However, if you hold SHIFT first, you can drag to select a group of points. When you let go, you can click again to drag the multiple points. After doing so, it will reset to single point select mode, so you need to hit SHIFT again to drag and select multiple points again.