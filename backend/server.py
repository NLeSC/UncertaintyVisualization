from flask import Flask, jsonify
import pandas as pd
import codecs
import os

app = Flask(__name__)


@app.route('/')
def hello():
    return jsonify({'#records': data.shape[0]})

if __name__ == '__main__':
    print('Loading data')
    data_dir = '/home/jvdzwaan/data/enron_data_date/enron_email_clean_json'

    dfs = []
    for doc in os.listdir(data_dir):
        json_file = os.path.join(data_dir, doc)
        with codecs.open(json_file, 'rb', encoding='utf-8') as f:
            dfs.append(pd.read_json(f))
    data = pd.concat(dfs)

    print('Finished loading data')

    app.run(debug=False)
