<?php
    function tiles_placeholders_apply($text)
    {
        $text = preg_replace('#\[\[([^|]+)\|([^\]]+)\]\]#ius', '<abbr title=\'$2\'>$1</abbr>', $text);
        $text = preg_replace('#%%([1-9a-z]+)(-rotated)?(-stacked-upper|-stacked-lower)?#is', '<span class="tile-icon$2 tile-icon$2-$1 tile-icon$3"><span class="wrap"><img src="icons/tiles$2.png"></span></span>', $text);
        return $text;
    }
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title><?php if (!empty($title)) { echo "Статьи о маджонге: " . $title . '.'; } else { echo "Статьи о маджонге."; } ?> ФУРИТЕН - Новосибирский клуб риичи-маджонга. </title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="O.Klimenko; Furiten club">

    <!-- Le styles -->
    <link href="assets/css/bootstrap.css" rel="stylesheet">
    <script src="assets/js/jquery.js"></script>
    <script src="assets/js/checkform.js"></script>
    <script src="assets/js/bootstrap.js"></script>
    <link href="assets/css/bootstrap-responsive.css" rel="stylesheet">
    <link href="icons/icons.css" rel="stylesheet">
    <link href="styles.css" rel="stylesheet">
    <link href="icons/icons-print.css" rel="stylesheet" media="print">
    <link href="print.css" rel="stylesheet" media="print">
    <style>
        body {
            padding-top: 60px; /* 60px to make the container go all the way to the bottom of the topbar */
        }
    </style>

    <!-- Le HTML5 shim, for IE6-8 support of HTML5 elements -->
    <!--[if lt IE 9]>
    <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->

    <!-- Le fav and touch icons -->
    <link rel="shortcut icon" href="/assets/ico/favicon.ico">
    <link rel="apple-touch-icon-precomposed" sizes="144x144" href="assets/ico/apple-touch-icon-144-precomposed.png">
    <link rel="apple-touch-icon-precomposed" sizes="114x114" href="assets/ico/apple-touch-icon-114-precomposed.png">
    <link rel="apple-touch-icon-precomposed" sizes="72x72" href="assets/ico/apple-touch-icon-72-precomposed.png">
    <link rel="apple-touch-icon-precomposed" href="assets/ico/apple-touch-icon-57-precomposed.png">

    <link rel="stylesheet" type="text/css" href="assets/styles.css">
</head>

<body>
<div class="navbar navbar-fixed-top">
    <div class="navbar-inner">
        <div class="container">
            <a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </a>
            <div class="nav-collapse">
                <ul class="nav">
                    <li><a href="http://furiten.ru/" title="Главная" style="padding-right:0; padding-bottom:0"><img src="http://furiten.ru/wp-content/themes/wordpress-bootstrap/assets/ico/apple-touch-icon-57-precomposed.png" style="height: 24px;"></a></li>
                    <li><a href="rules.php">Базовые правила</a></li>
                    <li><a href="yaku-list.php">Список яку</a></li>
                    <li><a href="dictionary-ja.php">Японские термины</a></li>
                    <li><a href="table-rules.php">Правила стола</a></li>
                    <?php
                    /* <li><a href="#">Защита</a></li>
                    <li><a href="#">Атака</a></li>
                    <li><a href="#">Советы и рекомендации</a></li>
                    */ ?>
                </ul>
            </div>
        </div>
    </div>
</div>
<div class="container">
    <?php echo tiles_placeholders_apply($content); ?>
</div>
<div class="clearfix"></div>
<div class="well">
    <table cellpadding=10 style="width:100%"><tr>
    <td style="width: 90px"><a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/3.0/deed.ru"><img alt="Лицензия Creative Commons" style="border-width:0" src="http://i.creativecommons.org/l/by-nc-sa/3.0/80x15.png" /></a></td>
    <td>Допускается любое распространение материалов в соответствии с лицензией Creative Commons BY-NC-SA при условии указания авторства и ссылки на оригинал.</td>
    <td>Новосибирский клуб маджонга "Фуритен", 2012.</td>
    <td><!--Openstat--><span id="openstat2139626"></span><script type="text/javascript">
        var openstat = { counter: 2139626, image: 5063, next: openstat }; document.write(unescape("%3Cscript%20src=%22http" +
            (("https:" == document.location.protocol) ? "s" : "") +
            "://openstat.net/cnt.js%22%20defer=%22defer%22%3E%3C/script%3E"));
    </script><!--/Openstat--></td>
</tr></table>
</div>
</body>
</html>

<?php

function _robot($host) {
    $robot_strings = array("yandex", "google", "robot", "crawl", "spider", "yahoo");
    foreach($robot_strings as $s) {
        if(strpos($host, $s)!==FALSE) return TRUE;
    }
    return FALSE;
}
// по-тихому логируем ^_^
if(substr($_SERVER['REMOTE_ADDR'],0,3)!="192" && !_robot(gethostbyaddr($_SERVER['REMOTE_ADDR']))) {
    $f=fopen("/www/blog.jetzone.org/furiten-articles-visitors.log", "a+");
    if (empty($_SERVER['HTTP_REFERER'])) {
        $ref = '';
    } else {
        $ref = $_SERVER['HTTP_REFERER'];
    }
    fwrite($f, sprintf("%20s", date("d-m-Y H:i:s"))." | ".sprintf("%-16s", $_SERVER['REMOTE_ADDR'])." (".gethostbyaddr($_SERVER['REMOTE_ADDR']).") | ".$ref." | ".$_SERVER['REQUEST_URI']."\n");
    fclose($f);
    unset($f);
}
