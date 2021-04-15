<h1 align="center">VIEW-SC+, BINP39 Project by Jiawei Zhao</h1>
<p align="left">This README file documents Jiawei Zhao's BINP39 project in developing <em>VIEW-SC+, a web tool for integrating steric clash prediction, 3D visualization and information mapping in PDB structures</em> at <a href="https://structure-next.med.lu.se">Protein Structure and Bioinformatics Group</a>, Faculty of Medicine, Lund University.</p>
<p>Project tutor: <em>Mauno Vihinen</em></p>
<p>The project web-app is now available at: <a href="https://structure-next.med.lu.se/view-scp">https://structure-next.med.lu.se/view-scp</a>
<br />  
<code>Notice: Your browser must support look-behind in JavaScript regex to display the website. Thus, Safari, Safari for iOS and IE can not display the website at the moment (April 2021)</code><hr>

[*Setting up fullstack VIEW-SCP service: prerequisites*](#view_scp_title)
+ [**Step 1. Clone the project repository from Github**](#step1)
+ [**Step 2. Install necessary dependencies for web-service and configure Firewall settings**](#step2)
+ [**Step 3. Set up index page for your domain**](#step3)
+ [**Step 4. Install PON-SC, program for identifying steric clashes caused by amino acid substitutions**](#step4)
[*Pre-existing source code that provides the basis for VIEW-SC+*](#papers)
+ [**PON-SC – program for identifying steric clashes caused by amino acid substitutions <em>(read)</em>**](#ponsc)

<br><a name="view_scp_title"></a>
<h2 align="center">How to set up fullstack VIEW-SCP service on a Linux server?</h2><br />
<p>Prerequisite: an account with <code>sudo</code> access on a Linux server (preferably CentOS 7). The following instruction assumes CentOS 7 as the operating system. Replace <code>yum</code> with <code>apt-get</code> if you use Ubuntu Server.</p>

<a name="step1"></a>
### Step 1. Clone the project repository from Github
#### assuming <code>/home/${username}/</code> as the initial working directory 
<code>cd ~ && git clone https://github.com/Orthologues/BINP39-Visualization-Project/</code><br />
<code>mv BINP39-Visualization-Project/react_ts_express_app ~/view-scp-fullstack && rm -rf BINP39-Visualization-Project</code><br />

<a name="step2"></a>
### Step 2. Install necessary dependencies at the OS and configure Firewall settings
#### Node14, Yarn, CertBot, Nginx, pm2 are necessary dependencies for web service
<code>sudo yum -y update && sudo yum -y upgrade</code><br />
<code>sudo yum install -y gcc-c++ make</code><br />
<code>curl -sL https://rpm.nodesource.com/setup_14.x | sudo -E bash -</code><br />
<code>sudo yum install -y nodejs</code>
#### Check the version of <code>node</code> and <code>npm</code>
<code>node -v && npm -v</code>
#### Install <code>yarn</code>, which is reputed to be a better javascript package management tool than <code>npm</code> 
<code>sudo npm install -g yarn && yarn -v</code>
#### Install <code>nginx</code>, a web server which provides efficient reverse-proxy
<code>sudo yum install -y epel-release</code><br />
<code>sudo yum –y install nginx && nginx -v</code><br />
<code>sudo systemctl start nginx</code><br />
<code>sudo systemctl status nginx</code><br />
#### Ensure that <code>nginx</code> starts up automatically whenever the server restarts
<code>sudo systemctl enable nginx</code>
#### Configure Firewall to Allow Traffic
<code>sudo firewall-cmd --zone=public --permanent --add-service=http</code><br />
<code>sudo firewall-cmd --zone=public --permanent --add-service=https</code><br />
<code>sudo firewall-cmd --reload</code><br />
#### Install <code>certbot</code> and its plugins for Nginx for SSL Certificates
<code>sudo yum install -y certbot</code><br />
<code>sudo yum install -y python-certbot-nginx</code><br />
#### Install <code>pm2</code> for management of Node.js processes
<code>sudo npm install -g pm2</code><br />


<a name="step3"></a>
### Step 3. Set up index page for your domain
#### This instruction assumes the root route of your server's public domain as hosting index.html file of your lab etc. As an example, the author of VIEW-SCP hosted the introduction page of Vihinen Lab at <a href="https://structure-next.med.lu.se">https://structure-next.med.lu.se</a>. Assuming the public domain name of your lab as <code>mylab.org</code>, front-end and back-end web services are hosted on mylab.org/view-scp and mylab.org/pon-scp instead. 
#### Create the directory i.e. <code>mylab.org</code> for your index page which consists of HTML, CSS, and maybe JavaScript files first. 
<code>cd ~ && mv mylab.org /var/www/</code><br />
<code>sudo setsebool -P httpd_can_network_connect on</code><br />
<code>sudo chcon -Rt httpd_sys_content_t /var/www/mylab.org/</code><br />
#### The index page would not be available since Nginx configs are not adjusted yet. You will do that later by modifying Nginx config files.

<a name="step4"></a>
### Step 4. Install PON-SC: program for identifying steric clashes caused by amino acid substitutions, which will be called by Node.js back-end scripts as Python subprocess
#### Settle <code>aaclash/</code> directory under <code>~/view-scp-fullstack</code>. <code>aaclash</code> consists of source code of <a href="https://pubmed.ncbi.nlm.nih.gov/29187139/">PON-SC</a>, which was written by Jelena Čalyševa and updated by Jiawei Zhao. Data availability of <code>aaclash</code>: Please contact Jiawei Zhao (ji8842zh-s@student.lu.se or jwz.student.bmc.lu@gmail.com).
#### Install <a href="http://webclu.bio.wzw.tum.de/stride/">STRIDE: a web server for secondary structure assignment from known atomic coordinates of proteins</a> (<a href="https://pubmed.ncbi.nlm.nih.gov/15215436/">PUBMED link</a>)
<code>cd ~/view-scp-fullstack/aaclash && mkdir -p STRIDE</code></br>
<code>curl -sSL http://webclu.bio.wzw.tum.de/stride/stride.tar.gz -o STRIDE/stride.tar.gz</code></br>
<code>cd ~/view-scp-fullstack/aaclash/STRIDE && tar -zxf stride.tar.gz && make</code></br>
#### Install <a href="http://webclu.bio.wzw.tum.de/stride/">STRIDE: a web server for secondary structure assignment from known atomic coordinates of proteins</a> (<a href="https://pubmed.ncbi.nlm.nih.gov/15215436/">PUBMED link</a>)
<code>cd ~/view-scp-fullstack/aaclash/STRIDE && tar -zxf stride.tar.gz && make</code></br>

<a name="papers"></a>
## Pre-existing source code that provides the basis for VIEW-SC+
<a name="ponsc"></a>
### PON-SC
[**Čalyševa J, Vihinen M. PON-SC - program for identifying steric clashes caused by amino acid substitutions. BMC Bioinformatics. 2017;18(1):531. Published 2017 Nov 29. doi:10.1186/s12859-017-1947-7**](https://pubmed.ncbi.nlm.nih.gov/29187139/)
