import csv
import requests 
import time
# API_ENDPOINT_UPDATE = "https://fierce-everglades-47378.herokuapp.com/deploys/update/"
API_ENDPOINT_ADD = "http://localhost:8080/report/"
API_ENDPOINT_UPDATE = "http://localhost:8080/deploys/update/"
API_DELETE = "https://fierce-everglades-47378.herokuapp.com/deploys/delete/"
FIELDS = 5

value = input("Please choose mode: ")

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
            if row[4] == "UPDATE":
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
                    j += 5
                print("Sending update deploy:")
                print(data)
                if value == '1':
                    input("press enter to continue...")
                r = requests.post(url = API_ENDPOINT_UPDATE, json= data) 
                time.sleep(3)
            elif row[4] == "ADD":
                data_to_add = {
                    "deployId": row[0],
                    "location": {
                        "type": "Point",
                        "coordinates": [float(row[1]), float(row[2])],
                        "elevation": float(row[3])
                    },
                    "reportingUserId": row[5],
                    "additionalInfo": row[6],
                    "amount": int(row[7]),
                    "deployType": row[8],
                    "tag": row[9]
                }
                line_count += 1
                print("Sending add deploy:")
                print(data_to_add)
                if value == '1':
                    input("press enter to continue...")
                r = requests.post(url = API_ENDPOINT_ADD, json= data_to_add) 
                print(r.text)
                time.sleep(3)
    print(f'Processed {line_count} lines.')
#    r = requests.delete(url = API_DELETE)

    