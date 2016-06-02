import tempfile
import os
import subprocess
import re
import shutil
import datetime
import json
from flask import request
from flask import Flask, render_template,redirect,url_for,jsonify
from werkzeug import secure_filename



app = Flask(__name__)

app.config['ALLOWED_EXTENSIONS'] = set(['json'])

# For a given file, return whether it's an allowed type or not
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in app.config['ALLOWED_EXTENSIONS']

# calling the home page
@app.route('/')
def home():
    return render_template('home.html')

# calculates the handle value which is important for storing the naf files
@app.route('/init')
def gethandle():
    workdir = tempfile.mkdtemp(prefix = "naf2json", dir = "/tmp")
    handle = os.path.basename(workdir)
    cleanup()
    return handle


@app.route('/upnaf', methods=['GET', 'POST'])
@app.route('/upnaf/<handle>', methods=['GET', 'POST'])
def upload_file(handle = None):
    if handle == None:
       workdir = tempfile.mkdtemp(prefix = "naf2json", dir = "/tmp")
       handle = os.path.basename(workdir)
    else:
        workdir = "/tmp/" + handle
    if request.method == 'POST':
        f = request.files['files[]']
        f.save(workdir + "/" + secure_filename(f.filename))
    json = subprocess.check_output(["./doit",  workdir])
    cleanup()
    return json


@app.route('/upjson', methods=['GET', 'POST'])
@app.route('/upjson/<handle>', methods=['GET', 'POST'])
def upload(handle = None):
    if handle == None:
        workdir = tempfile.mkdtemp(prefix="jsonfile",dir="/tmp")
        handle = os.path.basename(workdir)
    else:
        workdir = '/tmp/' + handle
    if request.method == "POST":
        uploaded_file= request.files["file[]"]
        if uploaded_file and allowed_file(uploaded_file.filename):
            uploaded_file.save(workdir + "/" + secure_filename(uploaded_file.filename))

        with open(workdir + "/" + secure_filename(uploaded_file.filename)) as json_file:
            json_data = json.load(json_file)
            return jsonify(**json_data)


@app.route('/getnaf', methods=['GET', 'POST'])
def naf2json():
    workdir = '/home/marla/newTimelineApp/app/static/naf'
    json = subprocess.check_output(["./doit", workdir])
    cleanup()
    return json


@app.route('/finit/<handle>')
def cleanhandle(handle = None):
    workdir = "/tmp/" + handle
    shutil.rmtree(workdir)
    cleanup()
    return 0

def root():
    return os.path.dirname(__file__)

pat = re.compile('naf2json\w*')

def cleanup():
    for filename in os.listdir("/tmp"):
        if pat.match(filename):
            filepath = "/tmp/" + filename
            filemodified = datetime.datetime.fromtimestamp(os.path.getmtime(filepath))
            existtime = datetime.datetime.now() - filemodified
            if existtime.total_seconds() > 7200:
                shutil.rmtree(filepath) 


if __name__ == '__main__':
#    app.debug = True
    app.run(debug=True)
