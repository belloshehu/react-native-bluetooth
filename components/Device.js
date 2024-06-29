import { View, Touchable, Text } from "react-native";
import { styles } from "../styles";

/* render list of bluetooth devices */
export const Device = ({ peripheral, connect, disconnect }) => {
  const { name, rssi, connected } = peripheral;
  return (
    <>
      {name && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 10,
          }}>
          <View style={styles.deviceItem}>
            <Text style={styles.deviceName}>{name}</Text>
            <Text style={styles.deviceInfo}>RSSI: {rssi}</Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              connected ? disconnect(peripheral) : connect(peripheral)
            }
            style={styles.deviceButton}>
            <Text
              style={[
                styles.scanButtonText,
                { fontWeight: "bold", fontSize: 16 },
              ]}>
              {connected ? "Disconnect" : "Connect"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};
