<#assign hst=JspTaglibs["http://www.hippoecm.org/jsp/hst/core"] >
<!doctype html>
<html lang="en">
    <head>
        <meta name="google-site-verification" content="vSrfYRrCbfMqGoggpdhADL9rvDQm70LtAHalmFmZ4wE"/>

        <@hst.headContributions categoryIncludes="dataLayer"/>
        <!-- dataLayer code MUST be higher than google tag manager code -->
        <@hst.headContributions categoryIncludes="googleTagManager"/>
        <@hst.headContributions categoryIncludes="resourcehints"/>
        <@hst.headContributions categoryIncludes="title"/>
        <@hst.headContributions categoryIncludes="schema"/>
        <@hst.headContributions categoryIncludes="meta"/>

        <meta charset="UTF-8">

        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" type="text/css" href="<@hst.webfile path="${css}"/>"/>
        <link href='https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900,400italic' rel='stylesheet' type='text/css'>


    <link rel="shortcut icon" href='<@hst.link path="favicon.ico" />' type="image/x-icon" />
    <link rel="apple-touch-icon" sizes="180x180" href='<@hst.link path="apple-touch-icon.png" />'>
    <link rel="icon" type="image/png" sizes="32x32" href='<@hst.link path="favicon-32x32.png" />'>
    <link rel="icon" type="image/png" sizes="16x16" href='<@hst.link path="favicon-16x16.png" />'>
    <link rel="mask-icon" href='<@hst.link path="safari-pinned-tab.svg" />' color="#0065bd">
    <meta name="msapplication-TileColor" content="#0065bd">
    <meta name="theme-color" content="#ffffff">



    <#if document??>
        <@hst.link var="canonicalLink" hippobean=document canonical=true fullyQualified=true/>
        <link rel="canonical" href="${canonicalLink}" />
    </#if>

    <script
  src="https://code.jquery.com/jquery-1.12.4.min.js"
  integrity="sha256-ZosEbRLbNQzLpnKIkEdrPv7lOy9C27hHQ+Xp8a4MxAQ="
  crossorigin="anonymous"></script>

    <script>
        var htmlClass = document.documentElement.getAttribute('class') || '';
        document.documentElement.setAttribute('class', (htmlClass ? htmlClass + ' ' : '') + 'js-enabled');
    </script>
    </head>

    <body>
        <@hst.include ref="googletagmanager"/>
        <@hst.include ref="preview-indicator"/>
        <div class="ds_page">
            <div class="ds_page__top">
                <@hst.include ref="notifications"/>
                <@hst.include ref="siteheader"/>
            </div>

            <div class="ds_page__main">
                <@hst.include ref="main"/>
            </div>

            <div class="ds_page__footer">
                <@hst.include ref="footer"/>
            </div>
        </div>

        <#include "breakpoint-tests.ftl">

        <@hst.headContributions categoryIncludes="footerScripts" xhtml=true/>
    </body>
</html>
