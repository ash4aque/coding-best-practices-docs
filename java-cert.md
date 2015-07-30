# How to install a Java certificate for CS's https

NOTE: If you install the cert prior to `Monday, September 29, 2014 at 5:00:00 PM Pacific Daylight Time`, you will need
to install the cert again as a new one has been issued.

The Client Services tier uses an https URL with a certificate that our Java installation
doesn't recognize. These instructions will help you configure Java to avoid the
SSL exception. They are for Chrome on a Mac, but may work on other browsers.

1. Visit the [CS API](https://atlas-hapi.stage.hapangaea.qa.walmart.com/api/) with your web browser.

2. Click the green lock to the left of the URL in the browser.

3. Click the "Connection" tab.

4. Click "Certificate Information".

5. In the tree view at the top, select the entry for "atlas-hapi.stage.hapangaea.qa.walmart.com".

6. Drag the icon of the official-looking certificate to your desktop. It will create a file called `atlas-hapi.stage.hapangaea.qa.walmart.com.cer`.

7. In a shell window, navigate to `$JAVA_HOME`. If that variable is not defined, try something like `/Library/Java/JavaVirtualMachines/jdk1.7.0_45.jdk/Contents/Home`.

8. Change to subdirectory `jre/lib/security`.

9. Run the following command. If it asks you for a password, that's your normal account sign-in password (for `sudo`).
    `sudo keytool -delete -noprompt -alias walmarthapi -keystore cacerts -storepass changeit`
    `sudo keytool -import -noprompt -trustcacerts -alias walmarthapi -file $HOME/Desktop/atlas-hapi.stage.hapangaea.qa.walmart.com.cer -keystore cacerts -storepass changeit`

10. Restart the tomcat/catalina server.

