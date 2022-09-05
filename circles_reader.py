import cv2
import numpy as np
import matplotlib.pyplot as plt
import csv


class ReadSeedInfo(object):

    def __init__(self, image_file, crop_start_x=485, crop_y_cut=130, crop_start_y=170, crop_end_y=390,
                 circle_ratio_small=1.1, circle_ratio_large=0.9, column_divisor=10.5, min_dist_ratio=1.5,
                 debug=False):

        self.debug = debug
        self.original = cv2.imread(image_file)

        if self.original.shape[0] > 720 and self.original.shape[1] > 720:
            self.original = self.resize_image(self.original)

        self.height, self.width = self.original.shape[:2]
        self.cropped_image = self.original[crop_start_x:self.height - crop_y_cut, crop_start_y:crop_end_y]

        if self.debug:
            cv2.imshow('img', self.cropped_image)
            cv2.waitKey(0)

        self.cropped_copy = self.cropped_image.copy()

        self.c_height, self.c_width = self.cropped_image.shape[:2]

        self.max_radius = int(circle_ratio_small * (self.c_width / column_divisor) / 2)
        self.min_radius = int(circle_ratio_large * (self.c_width / column_divisor) / 2)

        self.min_dist = min_dist_ratio

        self.circles = self.create_circles

        self.values_table = {
            '0': [False, False, False, False],
            '1': [False, False, False, False],
            '2': [False, False, False, False],
            '3': [False, False, False, False],
            '4': [False, False, False, False],
            '5': [False, False, False, False],
            '6': [False, False, False, False],
            '7': [False, False, False, False],
            '8': [False, False, False, False],
            '9': [False, False, False, False],
            '10': [False, False, False, False],
            '11': [False, False, False, False]
        }

        self.friendly_column_values = {
            '0': 'ianuarie',
            '1': 'februarie',
            '2': 'martie',
            '3': 'aprilie',
            '4': 'mai',
            '5': 'iunie',
            '6': 'iulie',
            '7': 'august',
            '8': 'septembrie',
            '9': 'octombrie',
            '10': 'noiembrie',
            '11': 'decembrie'
        }

        self.friendly_row_values = {
            '0': 'semanare',
            '1': 'cultivare',
            '2': 'udare',
            '3': 'recoltare'
        }


    def turn_gray(self):

        gray = cv2.cvtColor(self.cropped_image, cv2.COLOR_BGR2GRAY)

        return gray

    @staticmethod
    def resize_image(img, width=720, height=720):
        resize_width = width
        resize_height = height

        resize_dimensions = (resize_width, resize_height)

        resized_image = cv2.resize(img, resize_dimensions, interpolation=cv2.INTER_AREA)

        return resized_image

    @property
    def create_circles(self):

        min_dist = self.min_dist * self.min_radius
        min_radius = self.min_radius
        max_radius = self.max_radius

        self.circles = cv2.HoughCircles(image=self.turn_gray(), method=cv2.HOUGH_GRADIENT, dp=1, minDist=min_dist,
                                        param1=200, param2=6, minRadius=min_radius, maxRadius=max_radius)

        return self.circles

    @staticmethod
    def create_grid(img, line_color=(0, 255, 0), thickness=1, type_=cv2.LINE_AA, px_step=15):
        """
        (ndarray, 3-tuple, int, int) -> void
        draw gridlines on img
        line_color:
            BGR representation of colour
        thickness:
            line thickness
        type:
            8, 4 or cv2.LINE_AA
        pxstep:
            grid line frequency in pixels
        """
        step_x = px_step
        step_y = px_step

        while step_x < img.shape[1] / 4:
            cv2.line(img, (step_x + 8, 0), (step_x + 8, img.shape[0]), color=line_color, lineType=type_,
                     thickness=thickness)
            step_x += px_step

        while img.shape[1] / 4 < step_x < (img.shape[1] / 2):
            cv2.line(img, (step_x + 3, 0), (step_x + 3, img.shape[0]), color=line_color, lineType=type_,
                     thickness=thickness)
            step_x += px_step

        while (img.shape[1] / 2) < step_x < (img.shape[1] / 2) + (img.shape[1] / 4) + 10:
            cv2.line(img, (step_x - 3, 0), (step_x - 3, img.shape[0]), color=line_color, lineType=type_,
                     thickness=thickness)
            step_x += px_step

        while (img.shape[1] / 2) + (img.shape[1] / 4) < step_x < img.shape[1]:
            cv2.line(img, (step_x - 10, 0), (step_x - 10, img.shape[0]), color=line_color, lineType=type_,
                     thickness=thickness)
            step_x += px_step

        step_y -= 8
        while step_y < img.shape[0] / 4:
            cv2.line(img, (0, step_y), (img.shape[1], step_y), color=line_color, lineType=type_,
                     thickness=thickness)
            step_y += px_step

        while step_y < img.shape[0] / 2:
            step_y -= 5
            cv2.line(img, (0, step_y), (img.shape[1], step_y), color=line_color, lineType=type_,
                     thickness=thickness)
            step_y += px_step + 5

        while step_y < (img.shape[0] / 2) + (img.shape[0] / 4) + 10:
            step_y -= 12
            cv2.line(img, (0, step_y), (img.shape[1], step_y), color=line_color, lineType=type_,
                     thickness=thickness)
            step_y += px_step + 12

        while step_y < img.shape[0] + 10:
            step_y -= 18
            cv2.line(img, (0, step_y), (img.shape[1], step_y), color=line_color, lineType=type_,
                     thickness=thickness)
            step_y += px_step + 18

    @staticmethod
    def create_column_ranges(image_width):

        section_columns = {
            '0': range(0, int(image_width / 12)),
            '1': range(int(image_width / 12), int(image_width / 12) * 2),
            '2': range(int(image_width / 12) * 2, int(image_width / 12) * 3),
            '3': range(int(image_width / 12) * 3, int(image_width / 12) * 4),
            '4': range(int(image_width / 12) * 4, int(image_width / 12) * 5),
            '5': range(int(image_width / 12) * 5, int(image_width / 12) * 6),
            '6': range(int(image_width / 12) * 6, int(image_width / 12) * 7),
            '7': range(int(image_width / 12) * 7, int(image_width / 12) * 8),
            '8': range(int(image_width / 12) * 8, int(image_width / 12) * 9),
            '9': range(int(image_width / 12) * 9, int(image_width / 12) * 10),
            '10': range(int(image_width / 12) * 10, int(image_width / 12) * 11),
            '11': range(int(image_width / 12) * 11, int(image_width))
        }

        return section_columns

    @staticmethod
    def create_row_ranges(image_height):

        section_rows = {
            '0': range(0, int(image_height / 4)),
            '1': range(int(image_height / 4), int(image_height / 2)),
            '2': range(int(image_height / 2), int(image_height / 2) + int(image_height / 4)),
            '3': range(int(image_height / 2) + int(image_height / 4), image_height)
        }

        return section_rows

    def process_circles(self, pixel_count=15000):

        if self.circles is not None:
            # convert the (x, y) coordinates and radius of the circles to integers
            circles_round = np.round(self.circles[0, :]).astype("int")

            # if self.debug:
            #     self.create_grid(self.cropped_image)

            # loop over the (x, y) coordinates and radius of the circles
            for idx, (x, y, r) in enumerate(circles_round, start=0):

                circle = cv2.circle(self.cropped_image, (x, y), r - 1, (0, 255, 0), 1)[y - 10:y + 10, x - 10:x + 10]
                thresh = cv2.threshold(circle, 175, 255, cv2.THRESH_BINARY)[1]
                count = np.sum(np.where(thresh == 255))

                if self.debug:
                    print(f'Object number {idx} Pixel count is: {count}')

                if count > pixel_count and self.debug:
                    print(f'=====\nMarked object number {idx}:')

                for k, v in self.create_column_ranges(image_width=self.c_width).items():
                    if x in v and count > pixel_count:

                        if self.debug:
                            print(f'Found in column {k}')

                        for key, value in self.create_row_ranges(image_height=self.c_height).items():
                            if y in value:
                                self.values_table[k][int(key)] = True

                                if self.debug:
                                    print(f'Found value in row {key}')

                if self.debug:
                    cv2.imshow('img', self.cropped_image)
                    cv2.waitKey(0)
                    cv2.circle(self.cropped_image, (x, y), r - 1, (0, 255, 0), 1)
                    plt.imshow(self.cropped_image)

            if self.debug:
                print(self.values_table)
        else:
            print('No circles found')

        return self.values_table

    def process_values(self, value_table):

        for key, value in value_table.items():
            for item in value:
                item_index = value.index(item)
                if item is True:
                    value[item_index] = self.friendly_row_values[str(item_index)]
                else:
                    value[item_index] = ''

            value_table[key] = set(value)

        return value_table

    def write_circles_to_csv(self, csv_file, circles_data: dict, first_column_header='sku/image_name',
                             image_name='test_image'):
        headers = [first_column_header]
        values = [image_name]
        with open(csv_file, 'w', encoding='utf-8') as f:
            writer = csv.writer(f)
            for value in self.friendly_column_values.values():
                headers.append(value)

            writer.writerow(headers)

            for value in circles_data.values():
                values.append(','.join(value))

            writer.writerow(values)
