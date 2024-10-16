using UnityEngine;

public class ARCameraController : MonoBehaviour
{
    public Camera arCamera;

    public void MoveCameraToPosition(string jsonPosition)
    {
        Vector3 newPosition = JsonUtility.FromJson<Vector3>(jsonPosition);
        arCamera.transform.position = newPosition;
    }
}