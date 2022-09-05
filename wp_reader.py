import cv2
import numpy
import pytesseract
import re
import csv
import os

root_folder = r'root_folder_path'
campaigns = r'campaign_images_path'
groups = r'group_images_path'
campaign_results = r'campaign_results_path'
group_results = r'results_path'
image_name = ''
# image_name = ''
file_name = "recognized.txt"
csv_name = 'results.csv'


def file_create_flush(file):
    with open(file, "w+", encoding='utf-8') as new_file:
        new_file.write("")


def find_delivered_index(item_list: list):
    index = 0

    for i in range(len(item_list)):
        if re.match('Delivered', item_list[i]):
            index = i
            break

    return index


def find_read_index(item_list: list):
    index = 0

    for i in range(len(item_list)):
        if re.match('Read', item_list[i]):
            index = i
            break

    return index


def clean_list(values_list: list):
    new_list = list()

    for item in values_list:
        split_list = item.split('|')

        for seq in split_list:
            if len(seq) < 4:
                split_list.remove(seq)

        joined_item = '|'.join(split_list)

        new_list.append(joined_item)

    new_list = [item for item in new_list if item]

    return new_list


def clean_text(text: str):
    stripped_text = text.strip()
    remove_nl = re.sub('\\n+', '|', stripped_text)
    remove_nl = re.sub(r'[^a-zA-Z0-9., :|/-]+', '@', remove_nl)
    remove_nl = re.sub(r'[@]+', '', remove_nl)

    text = remove_nl

    return text


def process_image(image):
    pytesseract.pytesseract.tesseract_cmd = r'path_to_tessearct_exe'

    image = cv2.imread(image)
    to_grayscale = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    ret, threshold_1 = cv2.threshold(to_grayscale, 0, 255, cv2.THRESH_OTSU | cv2.THRESH_BINARY_INV)

    rectangle_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (40, 40))

    dilation = cv2.dilate(threshold_1, rectangle_kernel, iterations=1)
    contours, hierarchy = cv2.findContours(dilation, cv2.RETR_EXTERNAL,
                                           cv2.CHAIN_APPROX_NONE)

    image_copy = image.copy()

    return contours, hierarchy, image_copy


def detect_data(im2: numpy.ndarray, contours: tuple):
    text_list = list()

    for contour in contours:

        x, y, w, h = cv2.boundingRect(contour)
        apply_rectangle = cv2.rectangle(im2, (x, y), (x + w + w, y + h), (0, 255, 0), 2)
        if w > 300:
            cropped = im2[y:y + h, x:x + w]
        else:
            cropped = im2[y:y + h, x:x + w]

        '''
        ==================================
        Square out every recognized character
        '''
        # height_image, width_image, _ = cropped.shape
        # print(f'''
        # X: {x}
        # Y: {y}
        # H: {h}
        # W: {w}
        # Height: {height_image}
        # Width: {width_image}
        # Calculated: {x + int(((20 / 100) * w))}
        # ''')
        # boxes = pytesseract.image_to_boxes(cropped)
        # for b in boxes.splitlines():
        #     b = b.split(' ')
        #     print(b)
        #     x, y, w, h = int(b[1]), int(b[2]), int(b[3]), int(b[4])
        #     cv2.rectangle(cropped, (x, height_image - y), (w, height_image - h), (0, 0, 255), 1)
        #     cv2.putText(cropped, b[0], (x, height_image - y), cv2.FONT_HERSHEY_COMPLEX, 1, (50, 50, 255), 1)
        #
        # cv2.imshow('Result', cropped)
        # cv2.waitKey(0)

        '''
        ==================================
        '''

        '''
        ==================================
        Square out every recognized sentence
        '''

        # height_image, width_image, _ = cropped.shape
        # boxes = pytesseract.image_to_boxes(cropped)
        # print(height_image)
        # for x, b in enumerate(boxes.splitlines()):
        #     if x != 0:
        #         b = b.split(' ')
        #         print(b)
        #         if len(b) == 12:
        #             x, y, w, h = int(b[6]), int(b[7]), int(b[8]), int(b[9])
        #             cv2.rectangle(cropped, (x, y), (w+x, h+y), (0, 0, 255), 1)
        #             cv2.putText(cropped, b[11], (x, y), cv2.FONT_HERSHEY_COMPLEX, 1, (50, 50, 255), 1)
        #
        # cv2.imshow('Result', cropped)
        # cv2.waitKey(0)

        '''
        ==================================
        '''

        found_text = pytesseract.image_to_string(cropped)
        cleaned_text = clean_text(found_text)
        text_list.append(cleaned_text)

        # with open(file_name, "a", encoding='utf-8') as file:
        #     file.write(cleaned_text)
        #     file.write("\\n")

    return text_list


def create_group_csv(item_list: list, group_file: str):
    csv_headers = ['company_name']

    company_names = list()

    for item in item_list:
        names = item.split('|')
        company_names.append(names[0])

    with open(group_file, 'w', newline='') as results_file:
        writer = csv.writer(results_file)
        writer.writerow(header for header in csv_headers)

        for company in company_names:

            clean_text(company)

            writer.writerow([f'{company}'])

    return company_names


def create_campaign_csv(item_list: list, csv_name: str):
    read_index = find_read_index(item_list)
    delivered_index = find_delivered_index(item_list)
    delivered_final = list()
    read_final = list()
    campaign_bitly = ''

    r_exp = re.compile('.*remaining.*')
    csv_headers = ['company_name', 'date_sent', 'delivered', 'read', 'delivered_remaining', 'read_remaining',
                   'campaign_bitly']

    delivered_list = item_list[:delivered_index]
    read_list = item_list[delivered_index + 1:read_index]

    for item in item_list[read_index:]:
        if re.match('.*(https[a-zA-Z0-9:/.-]+).*', item):
            campaign_bitly = re.search('(https[a-zA-Z0-9:/.-]+)', item).group(0)

    delivered_list_remainder = delivered_list[0] if r_exp.match(delivered_list[0]) else ''
    read_list_remainder = read_list[0] if r_exp.match(read_list[0]) else ''

    if delivered_list_remainder:
        delivered_list.remove(delivered_list[0])
    if read_list_remainder:
        read_list.remove(read_list[0])

    parcel_data = {
        'delivered_list': delivered_list,
        'delivered_list_remainder': delivered_list_remainder,
        'read_list': read_list,
        'read_list_remainder': read_list_remainder
    }

    for unit in parcel_data['delivered_list']:
        split_delivery = unit.split('|')
        delivered_final.append(split_delivery)

    for unit in parcel_data['read_list']:
        split_read = unit.split('|')
        read_final.append(split_read)

    parcel_data['delivered_final'] = delivered_final
    parcel_data['read_final'] = read_final

    with open(csv_name, 'w', newline='') as results_file:
        writer = csv.writer(results_file)
        writer.writerow(header for header in csv_headers)

        for delivery_entry in delivered_final:

            clean_list(delivery_entry)

            try:
                writer.writerow([f'{delivery_entry[0]}', f'{delivery_entry[1]}',
                                     'TRUE', 'FALSE', f'{delivered_list_remainder}', '', f'{campaign_bitly}'])
            except IndexError:
                writer.writerow([f'{delivery_entry[0]}', f'UNKNOWN_DATE',
                                 'TRUE', 'FALSE', f'{delivered_list_remainder}', '', f'{campaign_bitly}'])

        for read_entry in read_final:

            clean_list(read_entry)
            try:
                writer.writerow([f'{read_entry[0]}', f'{read_entry[1]}', 'FALSE', 'TRUE', f'{read_list_remainder}', '',
                                 f'{campaign_bitly}'])
            except IndexError:
                writer.writerow([f'{read_entry[0]}', f'UNKNOWN_DATE', 'FALSE', 'TRUE', f'{read_list_remainder}', '',
                                 f'{campaign_bitly}'])

    return parcel_data


def batch_process(campaign: bool = None, group: bool = None):

    parse_data = ''
    results_loc = ''

    if campaign and not group:
        parse_data = campaigns
        results_loc = campaign_results
    elif group and not campaign:
        parse_data = groups
        results_loc = group_results
    elif (campaign and group) or (not group and not campaign):
        return None

    for file in os.listdir(parse_data):
        image = parse_data + file
        results = results_loc + re.sub(r'\.[A-Z]+$', '.csv', file)
        print(f'Working on: {image}\n')

        processed_image = process_image(image)

        print(f'Finished parsing image: {file}\n')

        read_wp = detect_data(processed_image[2], processed_image[0])

        print(f'Detected text in image: {file}\n')

        cleaned_list = clean_list(read_wp)

        print('Cleaned the found text.\n')

        if campaign:
            parcel = create_campaign_csv(cleaned_list, results)
        elif group:
            parcel = create_group_csv(cleaned_list, results)

        print(f'Finished reading. Data stored in file: {results}.\nSeeking the next file...\n')


if __name__ == '__main__':

    batch_process(campaign=True)
