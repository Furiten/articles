<?php
    function tiles_placeholders_apply($text)
    {
        $text = preg_replace('#%%([1-9a-z]+)(-rotated)?(-stacked-upper|-stacked-lower)?#is', '<span class="tile-icon$2 tile-icon$2-$1 tile-icon$3"><span class="wrap"><img src="icons/tiles$2.png"></span></span>', $text);
        return $text;
    }
?>
