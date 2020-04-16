import csv
import requests 
import time

with open('deploys.csv') as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=',')
    line_count = 0
    
    API_ENDPOINT = "http://localhost:8080/deploy/update/"
    API_DELETE = "http://localhost:8080/deploy/delete/"

    ID = ""

    for row in csv_reader:
        ID = row[0]
        if line_count == 0:
            print(f'Column names are {", ".join(row)}')
            line_count += 1
        else:
            data = {'location': {
                'type': 'Point',
                'coordinates': [float(row[1]), float(row[2])],
                'elevation': float(row[3])
            }}
            r = requests.post(url = API_ENDPOINT + row[0], json= data) 
            line_count += 1
            time.sleep(6)
    print(f'Processed {line_count} lines.')
    r = requests.delete(url = API_DELETE + ID)

    