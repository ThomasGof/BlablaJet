<?php
require_once 'autoloader.php';

class Image
{
    public static function imgResize($srcFile, $sizeMax, $content_dir)
    {
        $name_file = $srcFile['name'];
        $type_file = $srcFile['type'];
        $size_file = $srcFile['size'];
        $tmp_file = $srcFile['tmp_name'];
        $size_img = getimagesize($tmp_file);
        $largSrc = $size_img[0];
        $hautSrc =  $size_img[1];
        if ($largSrc < $hautSrc) {
            $largDest = ($sizeMax * $largSrc) / $hautSrc;
            $hautDest = $sizeMax;
        } elseif ($largSrc > $hautSrc) {
            $largDest = $sizeMax;
            $hautDest = ($sizeMax * $hautSrc) / $largSrc;
        } else {
            $largDest = $sizeMax;
            $hautDest = $sizeMax;
        }
        if (
            !strstr($type_file, 'jpg') && !strstr($type_file, 'jpeg')
            && !strstr($type_file, 'gif') && !strstr($type_file, 'png')
        ) {
            exit("Ce fichier n'est pas une image du type voulu.");
        }
        if ($size_file > 5000000) {
            exit("Ce fichier est trop lourd");
        }

        if (strstr($type_file, 'jpg') || strstr($type_file, 'jpeg')) {
            $img_new = imagecreatefromjpeg($tmp_file);
            $img_new_dest = imagecreatetruecolor($largDest, $hautDest);
            imagecopyresized(
                $img_new_dest,
                $img_new,
                0,
                0,
                0,
                0,
                $largDest,
                $hautDest,
                $largSrc,
                $hautSrc
            );
            imagejpeg($img_new_dest, $content_dir . $name_file, 100);
        }
        if (strstr($type_file, 'gif')) {
            $img_new = imagecreatefromgif($tmp_file);
            $img_new_dest = imagecreatetruecolor($largDest, $hautDest);
            imagecopyresized(
                $img_new_dest,
                $img_new,
                0,
                0,
                0,
                0,
                $largDest,
                $hautDest,
                $largSrc,
                $hautSrc
            );
            imagegif($img_new_dest, $content_dir . $name_file);
        }
        if (strstr($type_file, 'png')) {
            $img_new = imagecreatefrompng($tmp_file);
            $img_new_dest = imagecreatetruecolor($largDest, $hautDest);
            imagecopyresized(
                $img_new_dest,
                $img_new,
                0,
                0,
                0,
                0,
                $largDest,
                $hautDest,
                $largSrc,
                $hautSrc
            );
            imagepng($img_new_dest, $content_dir . $name_file, 0);
        }
        echo "<script>alert($content_dir + $name_file);</script>";
        return $content_dir . $name_file;
    }
}
