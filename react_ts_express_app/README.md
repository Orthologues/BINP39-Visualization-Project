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
+ [**Step 5. Install pdb2uniprot: Convert PDB residues to their Uniprot equivalents**](#step5)
+ [**Step 6. Install back-end web service in Node.js**](#step6)
+ [**Step 7. Install frontend-end web service in Create-React-App and Typescript**](#step7)
+ [**Step 8. Configure Nginx configs and Secure your domain with CertBot to render your website public**](#step8)
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
#### This instruction assumes the root route of your server's public domain as hosting index.html file of your lab etc. As an example, the author of VIEW-SCP hosted the introduction page of Vihinen Lab at <a href="https://structure-next.med.lu.se">https://structure-next.med.lu.se</a>. Assuming the public domain name (alias) of your lab as <code>mylab.org</code>, front-end and back-end web services are hosted on mylab.org/view-scp and mylab.org/pon-scp instead. 
#### Create the directory i.e. <code>mylab.org</code> for your index page which consists of HTML, CSS, and maybe JavaScript files first. 
<code>cd ~ && mv mylab.org /var/www/</code><br />
<code>sudo setsebool -P httpd_can_network_connect on</code><br />
<code>sudo chcon -Rt httpd_sys_content_t /var/www/mylab.org/</code><br />
#### The index page would not be available since Nginx configs are not adjusted yet. You will do that later by modifying Nginx config files.

<a name="step4"></a>
### Step 4. Install PON-SC: program for identifying steric clashes caused by amino acid substitutions, which will be called by Node.js back-end scripts as Python subprocess
#### Settle <code>aaclash/</code> directory under <code>~/view-scp-fullstack</code>. <code>aaclash</code> consists of source code of <a href="https://pubmed.ncbi.nlm.nih.gov/29187139/">PON-SC</a>, which was written by Jelena Čalyševa and updated by Jiawei Zhao. Data availability of <code>aaclash</code>: Please contact Jiawei Zhao (your_username@student.lu.se or jwz.student.bmc.lu@gmail.com).
#### Install <a href="http://webclu.bio.wzw.tum.de/stride/">STRIDE: a web server for secondary structure assignment from known atomic coordinates of proteins</a> (<a href="https://pubmed.ncbi.nlm.nih.gov/15215436/">PUBMED link</a>)
<code>cd ~/view-scp-fullstack/aaclash && mkdir -p STRIDE</code></br>
<code>curl -sSL http://webclu.bio.wzw.tum.de/stride/stride.tar.gz -o STRIDE/stride.tar.gz</code></br>
<code>cd ~/view-scp-fullstack/aaclash/STRIDE && tar -zxf stride.tar.gz && make</code></br>
<code>cd ~/view-scp-fullstack/aaclash/ && touch program_paths.py</code></br>
#### Add the following code to <code>~/view-scp-fullstack/aaclash/program_paths.py</code>
```python
STRIDE_PATH: str = '/home/your_username/view-scp-fullstack/aaclash/STRIDE'
SCRIPT_PATH: str = '/home/your_username/view-scp-fullstack/aaclash'
```
#### In order to run PON-SC scripts, ensure that you have installed <code>regex</code>, <code>numpy</code>, <code>biopython</code>, <code>scipy</code>, <code>scikit-learn</code>.

<a name="step5"></a>
### Step 5. Install pdb2uniprot: Convert PDB residues to their Uniprot equivalents
<code>cd ~/view-scp-fullstack/aaclash/</code><br />
<code>git clone https://github.com/mgalardini/pdb2uniprot</code></br>
<code>mv pdb2uniprot/parse_sifts.py . && rm -rf pdb2uniprot</code>

<a name="step6"></a>
### Step 6. Install back-end web service in Node.js
<code>cd ~/view-scp-fullstack/ && mv backend_build_config nodejs-backend</code><br />
<code>sudo chmod 755 *</code></br>
<code>cd nodejs-backend && yarn</code></br>
<code>vi ./routes/aaClashPred.js</code></br>
#### Find the line <code>const SENDER_EMAIL =</code> and modify the variable to your lab's email address
#### Add a file called <code>Secrets.js</code> to record the password of sender's email account
```javascript
export const SENDER_PWD = 'password_my_lab';
```
#### Add a file called <code>constants.js</code> to define vital constants
```javascript
// define port number and url prefix of the api server
export const PORT_NUM = 4999;
const URL_PREFIX = `http://localhost:${PORT_NUM.toString()}`;
export default URL_PREFIX; 
// absolute path of python binary
export const PY_PATH = '/your/py_path/bin/python';
// absolute path of aaclash scripts
export const AA_CLASH_PREFIX = '/home/your_username/view-scp-fullstack/aaclash';
//pdbE 
export const PDBE_WEB_PREFIX = 'https://www.ebi.ac.uk/pdbe/entry/pdb';
export const PDBE_API_PREFIX = 'https://www.ebi.ac.uk/pdbe/api/pdb/entry/summary';
```

<a name="step7"></a>
### Step 7. Install frontend-end web service in Create-React-App and Typescript
#### Unfortunately, due to the highly computationally insufficient nature of <a href="http://jmol.sourceforge.net/">JSmol</a>, we are currently unavailable to deliver the web application in React build mode aka a static website. Therefore, we have to use Node.js Dev server running on localhost plus Nginx reverse-proxy to serve this React web app. 
```bash
cd ~/view-scp-fullstack/
mv frontend_build_config/ react-scripts-frontend/
mv src/ public/ react-scripts-frontend/
cd react-scripts-frontend
yarn
```
#### Download Jmol and install JSmol inside <code>public</code> folder
```bash
cd public
curl -sSL https://sourceforge.net/projects/jmol/files/Jmol/Version%2014.31/Jmol%2014.31.36/Jmol-14.31.36-binary.tar.gz/download -o Jmol-14.31.36.tar.gz;
tar -xzf Jmol-14.31.36.tar.gz && rm Jmol-14.31.36.tar.gz;
mv jmol-14.31.36/jsmol.zip . && rm -rf jmol-14.31.36
unzip jsmol.zip && rm jsmol.zip && mv jsmol JSmol && cd JSmol
ls .|grep -v "JSmol.min.js"|grep -v "j2s"|grep -v "php"|while read noneed;do rm -rf $noneed;done
```
#### Run back-end and front-end service with pm2
```bash
cd ~/view-scp-fullstack/ && sudo vi ./start_pon-sc+.sh
```
#### Replace text in <code>start_pon-sc+.sh</code> with the following scripts
```bash
#! /usr/bin/bash

pm2 start /home/your_username/PON-SC+/nodejs-backend/pon_scp_express_srv.js --name pon-scp
pm2 --name view-scp start "export PORT=4998 && yarn --cwd /home/your_username/PON-SC+/react-scripts-frontend/ start"
```
#### Start to run Node.js services for both backend and frontend
```bash
./start_pon-sc+.sh
```

<a name="step8"></a>
### Step 8. Secure your domain with CertBot and edit Nginx Configs to render your website public
```bash
sudo certbot --nginx -d mylab.org
```
#### Add automatic renewal for your domain's SSL certificate
```bash
sudo crontab -e
```
#### Add the following line to the text file, save and exit
```bash
30 * * * * /usr/bin/certbot renew --quiet #checks renewal at the 30th minute every hour
0 5 * * * /usr/bin/find /home/ji8842zh-s/PON-SC+/aaclash-plus/templates/ -type f -mtime +14 -delete #delete record of pdb files which are older than 14 days everyday at 5am 
0 5 * * * /usr/bin/find /home/ji8842zh-s/PON-SC+/aaclash-plus/extra_files/ -type f -mtime +14 -delete #delete record of query files which are older than 14 days everyday at 5am 
```
```bash
cd /etc/nginx && sudo vi ./nginx.conf
```
#### Add the following lines to <code>/etc/nginx/nginx.conf</code>
```text
include /etc/nginx/conf.d/*.conf;
include /etc/nginx/sites-enabled/*;
```
#### Create a config file for your lab's domain name
```bash
touch sites-available/view-scp.conf
sudo ln -s /etc/nginx/sites-available/view-scp.conf /etc/nginx/sites-enabled/view-scp.conf
```
#### Replace configs in <code>view-scp.conf</code> with the following lines
```text
server {
    server_name mylab.org;
    access_log /var/log/nginx/view-scp.log;
    error_log /var/log/nginx/view-scp.log;
    listen [::]:443 ssl ipv6only=on; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/mylab.org/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/mylab.org/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

    ## index-site  
    location / {
        root /var/www/mylab.org;
        index index.html;
        try_files $uri $uri/ =404;
    }
    location /view-scp {
        proxy_pass http://127.0.0.1:4998; #reverse-proxy
        add_header X-Frame-Options "SAMEORIGIN" always;
    }
    location /pon-scp {
        client_max_body_size 64M;
        proxy_pass http://127.0.0.1:4999; #reverse-proxy
    }
}

server { ## redirect http request to https
    if ($host = mylab.org) {
        return 301 https://$host$request_uri;
    } # managed by Certbot
    if ($uri = mylab.org) {
        return 301 https://mylab.org;
    } 
    listen 80;
    listen [::]:80;
    server_name mylab.org;
    return 404; # managed by Certbot
}
```
#### Restart Nginx, then the services should become publicly available to HTTP/HTTPS requests!
```bash
sudo systemctl restart nginx
```

<a name="papers"></a>
## Pre-existing source code that provides the basis for VIEW-SC+
<a name="ponsc"></a>
### PON-SC
[**Čalyševa J, Vihinen M. PON-SC - program for identifying steric clashes caused by amino acid substitutions. BMC Bioinformatics. 2017;18(1):531. Published 2017 Nov 29. doi:10.1186/s12859-017-1947-7**](https://pubmed.ncbi.nlm.nih.gov/29187139/)
