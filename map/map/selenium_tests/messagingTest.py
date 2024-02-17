import unittest
from selenium import webdriver
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoAlertPresentException

class MapInteractionTest(unittest.TestCase):
    def setUp(self):
        self.driver = webdriver.Chrome()
        self.driver.get("http://127.0.0.1:8000/map/")

    def test_click_outside_circle(self):
        driver = self.driver
        driver.set_network_conditions(offline=True, latency=0, throughput=0)
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.ID, "map"))
        )
        map_element = driver.find_element(By.ID, "map")
        driver.implicitly_wait(5)

        marker = driver.find_element(By.CLASS_NAME, "clickable-circle")
        marker.click()

        try:
            alert = driver.switch_to.alert
            self.fail("Prompt appeared on click outside of circle.")
        except NoAlertPresentException:
            pass

    def test_click_within_circle(self):
        driver = self.driver
        driver.set_network_conditions(offline=True, latency=0, throughput=0)
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "map"))
        )

        map_element = driver.find_element(By.ID, "map")
        driver.implicitly_wait(5)
        action = ActionChains(driver)
        action.move_to_element_with_offset(map_element, 200, 250) 
        action.click()
        action.perform()

        WebDriverWait(driver, 10).until(EC.alert_is_present())
        try:
            alert = driver.switch_to.alert
            test_message = "This test was written by Selenium!"
            alert.send_keys(test_message)
            alert.accept()
        except NoAlertPresentException:
            self.fail("Prompt did not appear on click inside of circle.")
    
    def tearDown(self):
        self.driver.quit()

if __name__ == "__main__":
    unittest.main()
