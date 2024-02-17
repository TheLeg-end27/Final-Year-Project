import unittest
from selenium import webdriver
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class MapReportTest(unittest.TestCase):
    def setUp(self):
        self.driver = webdriver.Chrome()
        self.driver.get("http://127.0.0.1:8000/map/")

    def test_report_message(self):
        driver = self.driver
        driver.implicitly_wait(5)
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "leaflet-marker-icon"))
        )
        marker = driver.find_element(By.CLASS_NAME, "leaflet-marker-icon")
        marker.click()
        WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CLASS_NAME, "popup-container"))  
        )

        report_button = driver.find_element(By.CLASS_NAME, "popup-container")
        report_button.click()

        WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.ID, "report"))
        )
        select_reason = driver.find_element(By.ID, "reportReason")
        select_reason.click()
        select_reason.find_element(By.XPATH, "//option[. = 'Spam']").click()  
        
        submit_button = driver.find_element(By.ID, "reportSubmit")
        submit_button.click()

    def tearDown(self):
        self.driver.quit()

if __name__ == "__main__":
    unittest.main()
