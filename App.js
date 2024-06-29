import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  Platform,
  StatusBar,
  ScrollView,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  NativeModules,
  useColorScheme,
  TouchableOpacity,
  NativeEventEmitter,
  PermissionsAndroid,
} from "react-native";
import BleManager from "react-native-ble-manager";
import { Colors } from "react-native/Libraries/NewAppScreen";
import { DevicesList } from "./components/DevicesList";

const BleManagerModule = NativeModules.BleManager;
const BleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const App = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [connectedPeripherals, setConnectedPeripherals] = useState([]);
  const [discoveredDevices, setDiscoveredDevices] = useState([]);
  const peripherals = new Map();

  useEffect(() => {
    BleManager.enableBluetooth().then(() => {
      console.log("Bluetooth is turned on");
    });

    BleManager.start({ showAlert: false }).then(() => {
      console.log("Bluetooth manager started");
    });

    // get discovered devices
    const stopDiscoverListener = BleManagerEmitter.addListener(
      "BleManagerDiscoverPeripheral",
      (peripheral) => {
        peripherals.set(peripheral.id, peripheral);
        setDiscoveredDevices(Array.from(peripherals.values()));
      }
    );

    const stopConnectListener = BleManagerEmitter.addListener(
      "BleManagerConnectPeripheral",
      (peripheral) => {
        console.log("BleManagerConnectPeripheral", peripheral);
      }
    );

    const stopScanListener = BleManagerEmitter.addListener(
      "BleManagerStopScan",
      () => {
        setIsScanning(false);
        console.log("stopped scanning");
      }
    );

    // permission check

    if (Platform.OS === "android" && Platform.Version >= 23) {
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      ).then((result) => {
        if (result) {
          console.log("permission is ok");
        } else {
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          ).then((result) => {
            if (result) {
              console.log("User accepted permission");
            } else {
              console.log("User rejected permission");
            }
          });
        }
      });
    }

    return () => {
      stopDiscoverListener.remove();
      stopConnectListener.remove();
      stopScanListener.remove();
    };
  }, []);

  const handleGetConnectedPeripherals = () => {
    BleManager.getConnectedPeripherals([]).then((results) => {
      if (results.length === 0) {
        console.log("No connecrted peripheral found");
      } else {
        for (let i = 0; i < results.length; i++) {
          let peripheral = results[i];
          peripheral.connected = true;
          peripherals.set(peripheral.id, peripheral);
          setConnectedPeripherals(Array.from(peripherals.values()));
        }
      }
    });
  };

  // pair with device first before connecting to it
  const connectToPeripheral = (peripheral) => {
    BleManager.createBond(peripheral.id)
      .then(() => {
        peripheral.connected = true;
        peripherals.set(peripheral.id, peripheral);
        setConnectedPeripherals(Array.from(peripherals.values()));
        setDiscoveredDevices(Array.from(peripherals.values()));
        console.log(`Successfully paired with ${peripheral.name}`);
      })
      .catch((error) => {
        console.log(`Failed to connect to ${peripheral.name}`);
      });
  };

  // disconnect from a paired device
  const diconnectedPairedPeripheral = (peripheral) => {
    BleManager.disconnect(peripheral.id).then(() => {
      peripheral.connected = false;
      peripherals.set(peripheral.id, peripheral);
      setDiscoveredDevices(Array.from(peripherals.values()));
      setConnectedPeripherals(Array.from(peripherals.values()));
    });
  };

  const startScan = () => {
    if (!isScanning) {
      BleManager.scan([], 5, true)
        .then(() => {
          setIsScanning(true);
          console.log("scanning");
        })
        .catch((error) => {
          console.log("Scanning error", error);
        });
    }
  };
  const isDarkMode = useColorScheme() === "dark";

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  return (
    <SafeAreaView style={[backgroundStyle, styles.mainBody]}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        style={backgroundStyle}
        contentContainerStyle={styles.mainBody}
        contentInsetAdjustmentBehavior="automatic">
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
            marginBottom: 40,
          }}>
          <View>
            <Text
              style={{
                fontSize: 30,
                textAlign: "center",
                color: isDarkMode ? Colors.white : Colors.black,
              }}>
              React Native BLE Manager Tutorial
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.5}
            style={styles.buttonStyle}
            onPress={startScan}>
            <Text style={styles.buttonTextStyle}>
              {isScanning ? "Scanning" : "Scan Bluetooth Devices"}{" "}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <DevicesList
        devices={discoveredDevices}
        title={"Discovered devices"}
        connectHandler={connectToPeripheral}
        disconnectHandler={diconnectedPairedPeripheral}
      />
      <DevicesList
        devices={connectedPeripherals}
        title={"Connected devices"}
        connectHandler={connectToPeripheral}
        disconnectHandler={diconnectedPairedPeripheral}
      />
    </SafeAreaView>
  );
};
const windowHeight = Dimensions.get("window").height;

const styles = StyleSheet.create({
  mainBody: {
    flex: 1,
    justifyContent: "center",
    height: windowHeight,
  },
  buttonStyle: {
    backgroundColor: "#307ecc",
    borderWidth: 0,
    color: "#FFFFFF",
    borderColor: "#307ecc",
    height: 40,
    alignItems: "center",
    borderRadius: 30,
    marginLeft: 35,
    marginRight: 35,
    marginTop: 15,
  },
  buttonTextStyle: {
    color: "#FFFFFF",
    paddingVertical: 10,
    fontSize: 16,
  },
});
export default App;
