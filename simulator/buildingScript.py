import csv
import requests 
import time
API_ENDPOINT = "https://fierce-everglades-47378.herokuapp.com/deploys/update/"
# API_ENDPOINT = "http://localhost:8080/deploys/update/"
API_DELETE = "https://fierce-everglades-47378.herokuapp.com/deploys/delete/"
FIELDS = 4

with open('building.csv') as csv_file:
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
            time.sleep(3)
    print(f'Processed {line_count} lines.')

# time.sleep(6)
# print("10 minutes")
# obj = [{ 'location': {
#     'type': 'Point',
#     'coordinates': [34.802542668971704,32.09080387716905],
#     'elevtion': '10.921651848847377'
#     },
#     'deployId': '8'
# }]
# print(obj)
# r = requests.post(url = API_ENDPOINT, json= obj)

#    r = requests.delete(url = API_DELETE)

    