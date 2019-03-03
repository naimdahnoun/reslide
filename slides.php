<?php
function is_image($file) {
    $dot_position = strrpos($file, ".");
    if($dot_position === false){
        return false;
    }
    else {
        $sub = substr($file, $dot_position);
        if($sub === ".png" || $sub === ".jpg") {
            return true;
        }
        else {
            return false;
        }
    }
}

$dir = "user/slides/";
$files = scandir($dir);
$img_files = array_filter($files, "is_image");
$i = 0;
foreach ($img_files as $file) {
    if($i == 0) {
        echo ("<li id=\"slide_$i\" style=\"display:initial;\"><img id=\"img_$i\" src=\"$dir$file\" alt=\"slide $i\" /></li>");
    }
    else {
        echo ("<li id=\"slide_$i\" style=\"display:none;\"><img id=\"img_$i\" src=\"$dir$file\" alt=\"slide $i\" /></li>");
    }
    $i++;
}
?>
