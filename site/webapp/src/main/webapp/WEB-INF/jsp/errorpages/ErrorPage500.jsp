<% response.setStatus(500); %>
<%@ include file="/WEB-INF/jspf/htmlTags.jspf" %>
<%@ page isErrorPage="true" %>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>500 - Internal Server Error</title>
  <link rel="stylesheet" href="/webfiles/latest/assets/css/main.css">
  <link href='https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900,400italic' rel='stylesheet' type='text/css'>
</head>
<body>

  <%@ include file="header.html" %>

  <div class="ds_wrapper">
    <main class="ds_layout  ds_layout--tn-article">
      <div class="ds_layout__header">
        <header class="ds_page-header">
          <h1 class="ds_page-header__title">500 - Internal Server Error</h1>
        </header>
      </div>

      <div class="ds_layout__content">
        <p>
          <% out.println("An unexcepted error occurred. The name of the exception is:"); %>
          <%= exception %>
        </p>
      </div>
    </main>
  </div>

  <%@ include file="footer.html" %>

</body>
</html>
