import csv
import requests 
import time

API_ENDPOINT = "http://localhost:8080/deploys/update/"
API_DELETE = "http://localhost:8080/deploys/delete/"
FIELDS = 4

with open('deploys.csv') as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=',')
    line_count = 0

    for row in csv_reader:
        if line_count == 0:
            print(f'Column names are {", ".join(row)}')
            line_count += 1
        else:
            j = 0
            data = []
            for i in range(int(len(row) / FIELDS)): 
                data.append({
                    'location': {
                        'type': 'Point',
                        'coordinates': [float(row[j+1]), float(row[j+2])],
                        'elevation': float(row[j+3])
                    },
                    "deployId": row[j]
                })
                line_count += 1
                j += 4
            print("Sending update deploy:")
            print(data)
            r = requests.post(url = API_ENDPOINT, json= data) 
            time.sleep(5)
    print(f'Processed {line_count} lines.')
    r = requests.delete(url = API_DELETE)

    