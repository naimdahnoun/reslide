<?php
$user = $_GET["user"];
$slide = $_GET["slide"];
$filtered_user = preg_replace("/[^a-zA-Z0-9]+/", "", $user);
$filtered_slide = preg_replace("/[^0-9]+/", "", $slide);
$valid = $filtered_user === $user && $filtered_slide === $slide;
if($valid){
    if($user === "0"){
        function this_slide($var) {
            $head_removed = preg_replace("/[a-zA-Z0-9]+_/", "", $var);
            $idx = strrpos($head_removed, ".");
            if(idx === false){
                return false;
            }
            else {
                if(substr($head_removed, $idx) === ".rects") {
                    $slide_only = substr($head_removed, 0, $idx);
                    if($slide_only === $_GET["slide"]){
                        return true;
                    }
                    else{
                        return false;
                    }
                }
                else{
                    return false;
                }
            }
        }
        //Return all users' rectangles for this slide
        $dir = "user/";
        $files = scandir($dir);
        //$rect_files = array_filter($files, "is_rects");
        $slide_rects = array_filter($files, "this_slide");
        if(sizeof($slide_rects) == 0){
            echo("None");
        }
        else{
            $done_anything = false;
            foreach($slide_rects as $idx => $filename){
                if(file_exists($dir.$filename)){
                    $done_anything = true;
                    $file = fopen($dir.$filename, "r");
                    $filesize = filesize($dir.$filename);
                    $filetext = fread($file, $filesize);
                    fclose($file);
                    echo($filetext);
                }
            }
            if($done_anything === false){
                echo("Failure");
            }
        }
    }
    else{
        //Return just this user's rectangles for this slide
        $filename = "user/".$user."_".$slide.".rects";
        if(file_exists($filename)){
            $file = fopen($filename, "r");
            $filesize = filesize($filename);
            $filetext = fread($file, $filesize);
            fclose($file);
            echo($filetext);
        }
        else{
            echo("Failure");
        }
    }
}
else{
    echo("Failure");
}
?>