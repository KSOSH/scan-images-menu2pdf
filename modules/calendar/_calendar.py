try:
	import tkinter as tk
	from tkinter import ttk
except ImportError:
	import Tkinter as tk
	import ttk

import time
from tkcalendar import Calendar
from tkinter import *

if __name__ == '__main__':
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
	root = tk.Tk()

	root.title("Выбор даты начала меню")
	s = ttk.Style(root)
	s.theme_use('clam')

	tmr = time.localtime(time.time());
	def CalendarFn(top):
		def print_sel():
			rnn = cal.selection_get()
			print(rnn)
			top.destroy()
		rnn = "";
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
			expand=True
		)
		ttk.Button(
			top,
			text="ok",
			command=print_sel
		).pack()
		# p1 = PhotoImage(file = 'favicon.png')
		# Setting icon of master window
		# root.iconphoto(False, p1)
	ccal = CalendarFn(root)
	root.resizable(0, 0)
	center(root)
	root.mainloop()
