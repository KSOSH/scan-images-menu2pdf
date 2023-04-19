import tkinter as tk
import tkinter.filedialog
import sys
import os

"""
Получение директории приложения
"""
def resource_path(relative_path):
	try:
		base_path = sys._MEIPASS
	except Exception:
		base_path = os.path.abspath(".")
	return os.path.join(base_path, relative_path)

if __name__ == '__main__':
	root = tk.Tk()
	root.withdraw()

	rp = resource_path('favicon.ico')
	root.iconbitmap(rp)
	root.attributes('-topmost', 1)
	"""
	Запускаем окно выбора директории
	"""
	temp = (tkinter.filedialog.askdirectory())

	if(len(temp)==0):
		print("None")
	else:
		print(temp)
