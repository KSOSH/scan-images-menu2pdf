"""
Author: ProjectSoft <projectsoft2009@yandex.ru>
"""
import sys
import os
import time
from tkinter import *
from tkinter import ttk
import tkinter.filedialog
from tkcalendar import Calendar
import json
import argparse
from array import array

parser=argparse.ArgumentParser(
	description="DIALOGS"
)
parser.add_argument('--directory', help="Directory open prompt", action='store_true')
parser.add_argument('--calendar', help="Calendar open prompt", action='store_true')
parser.add_argument('--typemenu', type=str, help='Type Menu open prompt JSON', action='store')

args = parser.parse_args()

if __name__ == '__main__':
	"""
	Получение директории приложения
	"""
	def resource_path(relative_path):
		try:
			base_path = sys._MEIPASS
		except Exception:
			base_path = os.path.abspath(".")
		return os.path.join(base_path, relative_path)
	"""
	Установка окна приложения по центру экрана
	"""
	def center(win):
		win.update_idletasks()
		width = win.winfo_width()
		frm_width = win.winfo_rootx() - win.winfo_x()
		win_width = width + 2 * frm_width
		height = win.winfo_height()
		titlebar_height = win.winfo_rooty() - win.winfo_y()
		win_height = height + titlebar_height + frm_width
		x = win.winfo_screenwidth() // 2 - win_width // 2
		y = win.winfo_screenheight() // 2 - win_height // 2
		win.geometry('{}x{}+{}+{}'.format(width, height, x, y))
		win.deiconify()

	"""
	Open DIrectory
	"""
	if args.directory:
		root = Tk()
		root.withdraw()
		rp = resource_path('favicon.ico')
		root.iconbitmap(rp)
		root.attributes('-topmost', 1)
		temp=tkinter.filedialog.askdirectory()
		if not temp:
			print("None")
		else:
			print(temp)
	"""
	Open Calendar
	"""
	if args.calendar:
		root = Tk()
		rp = resource_path('favicon.ico')
		root.iconbitmap(rp)
		root.title("Выбор даты начала меню")
		"""
		Получаем время
		"""
		tmr = time.localtime(time.time());
		"""
		Функция создания календаря
		"""
		def CalendarFn(top):
			"""
			Клик по кнопке
			"""
			def click_button_calendar():
				index = cal.selection_get()
				print(index)
				top.destroy()

			index = "";
			cal = Calendar(
				top,
				font="Arial 14",
				selectmode='day',
				year=tmr.tm_year,
				month=tmr.tm_mon,
				day=tmr.tm_mday,
				locale='ru_RU'
			)
			cal.pack(
				fill="both",
				expand=True,
				pady=(0, 6)
			)
			ttk.Button(
				top,
				text="Ок",
				command=click_button_calendar
			).pack(
				pady=(10, 12)
			)
		ccal = CalendarFn(root)
		root.resizable(0, 0)
		center(root)
		root.attributes('-topmost', 1)
		root.mainloop()
		
	"""
	Open Type Menu JSON
	"""
	if args.typemenu:
		"""
		Выбор в ComboBox
		"""

		selection = 0
		root = Tk()
		rp = resource_path('favicon.ico')
		root.iconbitmap(rp)
		root.title("Выбор типа меню")
		arg = args.typemenu
		values = []
		data = json.loads(args.typemenu)
		for dt in data:
			values.append(dt["name"])

		type_menu = StringVar(value=values[0])

		ttk.Label(
			text="Выберите тип меню:"
		).pack(
			anchor=NW,
			padx=10,
			pady=6
		)

		def selected(event):
			global selection
			selection = combobox.current()
		"""
		Клик Кнопки
		"""
		def click_button_type():
			global selection
			print(selection)
			root.destroy()

		combobox = ttk.Combobox(
			textvariable=type_menu,
			values=values,
			state="readonly",
			width=50
		)
		combobox.pack(
			anchor=N,
			padx=10,
			pady=(0, 6),
			expand=True
		)
		combobox.bind(
			"<<ComboboxSelected>>",
			selected
		)

		ttk.Button(
			root,
			text="Ок",
			command=click_button_type
		).pack(
			padx=10,
			pady=(6, 12)
		)
		center(root)
		root.resizable(0, 0)
		root.attributes('-topmost', 1)
		root.mainloop()