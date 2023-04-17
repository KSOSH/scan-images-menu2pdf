import importlib
import json
import argparse
import sys
from array import array
from tkinter import *
from tkinter import ttk

root = Tk()
root.title("Выбор типа меню")
root.geometry("300x100")


"""
Сделать передачу JSON в программу
parser=argparse.ArgumentParser(
	description="Read JSON"
)
parser.add_argument('json', type=str, help='JSON data', default='{}')
args = parser.parse_args()
"""

values = []
with open('new.json') as f:
	templates = json.load(f)
for section in templates:
	line = section["name"]
	values.append(line)

languages_var = StringVar(value=values[0])
selection = "0"

def center(win):
	"""
	centers a tkinter window
	:param win: the main window or Toplevel window to center
	"""
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

def selected(event):
	global selection
	selection = combobox.current()

def click_button():
	global selection
	print(selection)
	root.destroy()

label = ttk.Label(text="Выберите тип меню:")
label.pack(anchor=NW, padx=6, pady=6)

combobox = ttk.Combobox(textvariable=languages_var, values=values, state="readonly")
combobox.pack(anchor=N, padx=6, pady=6, expand=True)
combobox.bind("<<ComboboxSelected>>", selected)

btn = ttk.Button(text="Ok", command=click_button)
btn.pack(anchor=N, padx=6, pady=0, expand=True)
center(root)
root.resizable(0, 0)
root.mainloop()
