<?php
$user = $_GET["user"];
$slide = $_GET["slide"];
$filtered_user = preg_replace("/[^a-zA-Z0-9]+/", "", $user);
$filtered_slide = preg_replace("/[^0-9]+/", "", $slide);
$valid = $filtered_user === $user && $filtered_slide === $slide;
if($valid){
    $filename = "user/".$user."_".$slide.".rects";
    $success = unlink($filename);
    if($success){
    	echo("Success");
    }
    else{
    	echo("Failure");
    }
}
else {
    echo("Failure");
}
?>