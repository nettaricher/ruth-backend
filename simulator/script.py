import csv
import requests 
import time

with open('deploys.csv') as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=',')
    line_count = 0
    
    API_ENDPOINT = "http://localhost:8080/deploy/update/"
    for row in csv_reader:
        if line_count == 0:
            print(f'Column names are {", ".join(row)}')
            line_count += 1
        else:
            data = {"location": {
                "type": "Point",
                "coordinates": [row[1],row[2]],
                "elevation": row[3]
            }}
            r = requests.post(url = API_ENDPOINT + row[0], data = data) 
            line_count += 1
            time.sleep(10)
    print(f'Processed {line_count} lines.')

    