from typing import Any

from selenium.common.exceptions import (
    NoSuchElementException as NoSuchElementException,
    UnexpectedTagNameException as UnexpectedTagNameException,
)
from selenium.webdriver.common.by import By as By

class Select:
    is_multiple: Any
    def __init__(self, webelement) -> None: ...
    @property
    def options(self): ...
    @property
    def all_selected_options(self): ...
    @property
    def first_selected_option(self): ...
    def select_by_value(self, value) -> None: ...
    def select_by_index(self, index) -> None: ...
    def select_by_visible_text(self, text) -> None: ...
    def deselect_all(self) -> None: ...
    def deselect_by_value(self, value) -> None: ...
    def deselect_by_index(self, index) -> None: ...
    def deselect_by_visible_text(self, text) -> None: ...
