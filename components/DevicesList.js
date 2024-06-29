import { Device } from "./Device";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { styles } from "../styles";

export const DevicesList = ({
  devices,
  title,
  connectHandler,
  disconnectHandler,
}) => {
  if (devices.length === 0)
    return (
      <View style={styles.separator}>
        <Text style={styles.noDevicesText}>No {title}</Text>
      </View>
    );
  return (
    /* list of scanned bluetooth devices */
    <View style={styles.separator}>
      <Text style={styles.noDevicesText}>{title}</Text>
      <FlatList
        data={devices}
        renderItem={({ item }) => (
          <Device
            peripheral={item}
            connect={connectHandler}
            disconnect={disconnectHandler}
          />
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};
