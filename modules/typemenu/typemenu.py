# import importlib
import json
import argparse
import sys
import os
from array import array
from tkinter import *
from tkinter import ttk
"""
Получение параметра --json
"""
parser=argparse.ArgumentParser(
	description="Read JSON"
)
parser.add_argument('--json', type=str, help='JSON data', default='{}')
args = parser.parse_args()
"""
Старт программы
"""
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
	Выбор в ComboBox
	"""
	def selected(event):
		global selection
		selection = combobox.current()
	"""
	Клик Кнопки
	"""
	def click_button():
		global selection
		print(selection)
		root.destroy()

	root = Tk()
	root.title("Выбор типа меню")
	rp = resource_path('favicon.ico')
	root.iconbitmap(rp)

	arg = args.json
	values = []
	"""
	Читаем JSON
	"""
	data = json.loads(arg)
	for dt in data:
		values.append(dt["name"])

	selection = 0

	type_menu = StringVar(value=values[0])

	ttk.Label(
		text="Выберите тип меню:"
	).pack(
		anchor=NW,
		padx=10,
		pady=6
	)

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
		command=click_button
	).pack(
		padx=10,
		pady=(6, 12)
	)

	center(root)
	root.resizable(0, 0)
	root.attributes('-topmost', 1)
	root.mainloop()
