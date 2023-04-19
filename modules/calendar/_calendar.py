"""
Author: ProjectSoft <projectsoft2009@yandex.ru>
"""

from tkinter import *
from tkinter import ttk
import time
import sys
import os
from tkcalendar import Calendar

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
	Старт программы
	"""
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
		def click_button():
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
			command=click_button
		).pack(
			pady=(10, 12)
		)
	ccal = CalendarFn(root)
	root.resizable(0, 0)
	center(root)
	root.attributes('-topmost', 1)
	root.mainloop()
